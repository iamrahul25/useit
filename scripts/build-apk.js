const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const buildsDir = path.join(rootDir, 'builds');
const packageJsonPath = path.join(rootDir, 'package.json');

// Target reanimated version for APK builds
const BUILD_REANIMATED_VERSION = '4.5.5';

// Read original reanimated version from package.json
let ORIGINAL_REANIMATED_VERSION = '^3.17.4';
try {
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (pkg.dependencies && pkg.dependencies['react-native-reanimated']) {
      ORIGINAL_REANIMATED_VERSION = pkg.dependencies['react-native-reanimated'];
    }
  }
} catch (err) {
  console.warn('⚠️ Could not read original reanimated version, defaulting to ^3.17.4');
}

function setReanimatedVersionInPackageJson(version) {
  if (fs.existsSync(packageJsonPath)) {
    let content = fs.readFileSync(packageJsonPath, 'utf8');
    content = content.replace(
      /"react-native-reanimated":\s*"[^"]+"/,
      `"react-native-reanimated": "${version}"`
    );
    fs.writeFileSync(packageJsonPath, content, 'utf8');
  }
}

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function runNpmInstall() {
  console.log(`\n📥 Running npm install to sync dependencies...\n`);
  const res = spawnSync(npmCmd, ['install'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
  });
  if (res.status !== 0) {
    console.warn(`⚠️ npm install exited with status code ${res.status}`);
  }
}

let isReverted = false;
function revertAndRestore() {
  if (isReverted) return;
  isReverted = true;
  console.log(`\n🔄 Reverting react-native-reanimated version back to ${ORIGINAL_REANIMATED_VERSION}...`);
  setReanimatedVersionInPackageJson(ORIGINAL_REANIMATED_VERSION);
  runNpmInstall();
}

// Ensure version revert on interrupt or error signals
process.on('SIGINT', () => {
  console.log(`\n⚠️ Interrupted build process.`);
  revertAndRestore();
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('\n❌ Uncaught Exception:', err);
  revertAndRestore();
  process.exit(1);
});

// Determine build mode (debug or release)
const modeArg = (process.argv[2] || 'debug').toLowerCase();
const mode = modeArg === 'release' ? 'release' : 'debug';

console.log(`==================================================`);
console.log(`🚀 Starting APK Build Process`);
console.log(`📌 Target Mode: ${mode.toUpperCase()}`);
console.log(`==================================================\n`);

// Ensure builds directory exists
if (!fs.existsSync(buildsDir)) {
  fs.mkdirSync(buildsDir, { recursive: true });
}

// Read app information from app.json or package.json
let appName = 'UseIt';
let version = '1.0.0';

try {
  const appJsonPath = path.join(rootDir, 'app.json');
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    appName = appJson.expo?.name || appName;
    version = appJson.expo?.version || version;
  }
} catch (e) {
  console.warn('⚠️ Could not read app.json, using defaults.');
}

console.log(`📦 Temporarily updating react-native-reanimated to ${BUILD_REANIMATED_VERSION} for build...`);
setReanimatedVersionInPackageJson(BUILD_REANIMATED_VERSION);
runNpmInstall();

let buildError = null;

try {
  const androidDir = path.join(rootDir, 'android');

  // Ensure android directory exists via Expo Prebuild
  if (!fs.existsSync(androidDir)) {
    console.log('📦 Android native project not found. Running Expo prebuild...');
    const prebuildRes = spawnSync('npx', ['expo', 'prebuild', '--platform', 'android', '--clean'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true,
    });
    if (prebuildRes.status !== 0) {
      throw new Error('Expo prebuild failed.');
    }
  }

  // Clean stale CXX cache if mismatch exists
  try {
    fs.rmSync(path.join(androidDir, 'app', '.cxx'), { recursive: true, force: true });
    fs.rmSync(path.join(rootDir, 'node_modules', 'react-native-reanimated', 'android', '.cxx'), { recursive: true, force: true });
  } catch (_) {}

  // Determine Gradle command based on OS
  const isWindows = process.platform === 'win32';
  const gradlewCmd = isWindows ? 'gradlew.bat' : './gradlew';
  const gradleTask = mode === 'release' ? 'assembleRelease' : 'assembleDebug';

  console.log(`\n🔨 Building ${mode.toUpperCase()} APK with Gradle (${gradleTask})...`);

  const gradlewPath = path.join(androidDir, gradlewCmd);
  if (!fs.existsSync(gradlewPath)) {
    throw new Error(`Gradle wrapper (${gradlewCmd}) not found in ${androidDir}`);
  }

  const gradleBuild = spawnSync(gradlewCmd, [gradleTask], {
    cwd: androidDir,
    stdio: 'inherit',
    shell: true,
  });

  if (gradleBuild.status !== 0) {
    throw new Error(`Gradle build failed with exit code ${gradleBuild.status}`);
  }

  // Search for built APK file
  const apkSubDir = path.join(androidDir, 'app', 'build', 'outputs', 'apk', mode);
  if (!fs.existsSync(apkSubDir)) {
    throw new Error(`Expected output directory not found: ${apkSubDir}`);
  }

  const apkFiles = fs.readdirSync(apkSubDir).filter((file) => file.endsWith('.apk'));
  if (apkFiles.length === 0) {
    throw new Error(`No .apk file found in ${apkSubDir}`);
  }

  const sourceApkName = apkFiles[0];
  const sourceApkPath = path.join(apkSubDir, sourceApkName);

  const sanitizedAppName = appName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const targetApkName = `${sanitizedAppName}-v${version}-${mode}.apk`;
  const targetApkPath = path.join(buildsDir, targetApkName);

  fs.copyFileSync(sourceApkPath, targetApkPath);
  const stats = fs.statSync(targetApkPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`\n==================================================`);
  console.log(`🎉 APK BUILD SUCCESSFUL!`);
  console.log(`==================================================`);
  console.log(`📦 Mode     : ${mode.toUpperCase()}`);
  console.log(`📁 File Name: ${targetApkName}`);
  console.log(`📍 Path     : ${targetApkPath}`);
  console.log(`⚖️  Size     : ${fileSizeInMB} MB`);
  console.log(`==================================================\n`);

} catch (err) {
  buildError = err;
} finally {
  revertAndRestore();
}

if (buildError) {
  console.error(`\n❌ APK build failed: ${buildError.message}`);
  process.exit(1);
}
