import { getBuildProfile, getReleaseProfile } from '../../device-catalog.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEVICE_PROFILES } from '../../../docs/assets/javascripts/installer-contract.mjs';

function read(path) {
  return fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
}

function requireMarker(source, marker, label) {
  assert.ok(source.includes(marker), `${label} is missing: ${marker}`);
}

const base = 'src/devices/guition_jc4880p443_portrait';
const select = read('src/devices/device_select.h');
const active = read('src/devices/active_device.h');
const metadata = read('src/core/firmware/firmware_metadata.cpp');
const profile = read(`${base}/profile.h`);
const config = read(`${base}/vendor/displays_config.h`);
const driver = read(`${base}/device_guition_jc4880p443_portrait.cpp`);
const touch = read(`${base}/vendor/gt911.h`);
const panel = read(`${base}/vendor/panel_init_cmds.c`);
const sketch = read('sketch.yaml');
const workflow = read('.github/workflows/firmware.yml');
const displayManager = read('src/core/display/display_manager.cpp');

requireMarker(select, 'defined(DEVICE_GUITION_JC4880P443_PORTRAIT)', 'device selector');
requireMarker(active, `${base}/device_guition_jc4880p443_portrait.h`, 'active device');
requireMarker(metadata, '"guition_jc4880p443_portrait"', 'firmware metadata');
requireMarker(profile, '"guition_jc4880p443_portrait"', 'profile key');
requireMarker(profile, '"Guition JC4880P443 Portrait"', 'display name');
requireMarker(profile, '    480,\n    800,', 'portrait resolution');
requireMarker(profile, '    4,\n    6,', 'portrait grid');
requireMarker(profile, '    10,\n    3,\n    111,\n    124,', 'portrait grid geometry');
requireMarker(driver, 'draw_portrait_area', 'portrait-native flush');
requireMarker(driver, '180-deg CPU mirror', 'portrait 180-degree CPU mirror');
requireMarker(driver, 'dst_x = panel_w - x - w', 'portrait flip destination');
requireMarker(driver, 'dst_row[w - 1 - sx] = src_row[sx]', 'portrait flip pixels');
requireMarker(driver, 'Transform::Native0Or180', 'portrait camera transform');
requireMarker(config, '    34000000,\n    500,\n    480,\n    800,', 'panel timing');
requireMarker(config, '    7,\n    8,\n    400000,\n    5,', 'touch and reset pins');
requireMarker(driver, 'constexpr gpio_num_t kBacklightPin = GPIO_NUM_23;', 'backlight pin');
requireMarker(driver, 'constexpr bool kBacklightActiveLow = false;', 'backlight polarity');
requireMarker(driver, 'MIPI_DSI_PHY_PLLREF_CLK_SRC_PLL_F20M', 'pre-v3 DSI clock');
requireMarker(driver, 'esp_lcd_new_panel_st7701', 'ST7701 driver');
requireMarker(displayManager, '!defined(DEVICE_GUITION_JC4880P443_PORTRAIT) && \\', 'shared touch rotation exclusion');
const rotationFn = 'void DeviceGuitionJC4880P443Portrait::displaySetRotation(uint8_t rotation) {';
const rotationStart = driver.indexOf(rotationFn);
assert.ok(rotationStart >= 0, 'rotation entry point is missing');
const rotationBody = driver.slice(rotationStart, driver.indexOf('\n}\n', rotationStart));
assert.doesNotMatch(
  rotationBody,
  /esp_lcd_panel_mirror|esp_lcd_panel_swap_xy|LCD_CMD_MADCTL|esp_lcd_panel_io_tx_param/,
  'rotation must stay a CPU mirror: DCS scan-direction changes lose video lock',
);
const portraitFn = 'bool draw_portrait_area(int32_t x, int32_t y, int32_t w, int32_t h, const uint16_t* data) {';
const portraitStart = driver.indexOf(portraitFn);
assert.ok(portraitStart >= 0, 'portrait flush entry point is missing');
const portraitBody = driver.slice(portraitStart, driver.indexOf('\n}\n', portraitStart));
requireMarker(portraitBody, 'millis() - g_ppa_reinit_at_ms', 'PPA client re-init retry');
requireMarker(touch, '#define EXAMPLE_PIN_NUM_TOUCH_RST       (GPIO_NUM_NC)', 'touch reset');
requireMarker(touch, '#define EXAMPLE_PIN_NUM_TOUCH_INT       (GPIO_NUM_NC)', 'touch interrupt');
requireMarker(panel, 'kGuitionSt7701Init4880P443', 'Guition init table');
requireMarker(sketch, '  guition_jc4880p443_portrait:', 'build profile');
requireMarker(sketch, 'FlashSize=16M', '16M flash selection');
requireMarker(sketch, 'ChipVariant=prev3', 'pre-v3 build selection');
const catalogEntry = getBuildProfile('guition_jc4880p443_portrait');
assert.equal(catalogEntry.define, 'DEVICE_GUITION_JC4880P443_PORTRAIT');
assert.equal(catalogEntry.publish, true, 'portrait is a published profile');
assert.equal(catalogEntry.flashSize, 16 * 1024 * 1024);
assert.equal(catalogEntry.siliconVariant, 'pre_v3');
for (const marker of [
  'label: Guition JC4880P443',
  'profile: guition_jc4880p443_portrait',
  'key: guition_jc4880p443_portrait',
  'define: DEVICE_GUITION_JC4880P443_PORTRAIT',
  'silicon_variant: pre_v3',
  'rx_variant: repo-a8204',
  'node tools/run-tests.mjs',
  '--verify-release-assets',
]) {
  requireMarker(workflow, marker, 'firmware workflow');
}
const releaseProfile = getReleaseProfile('guition_jc4880p443_portrait');
assert.equal(releaseProfile.siliconVariant, 'pre_v3');
assert.equal(releaseProfile.legacySlug, 'guition-jc4880p443-portrait');
assert.equal(releaseProfile.metadataDeviceKey, 'guition_jc4880p443_portrait');

const installer = DEVICE_PROFILES.find(
  (candidate) => candidate.key === 'guition_jc4880p443_portrait',
);
assert.ok(installer, 'browser installer profile is missing');
assert.equal(installer.buildProfile, 'guition_jc4880p443_portrait');
assert.equal(installer.chipFamily, 'ESP32-P4');
assert.equal(installer.flashSize, 16 * 1024 * 1024);
assert.equal(installer.siliconVariant, 'pre_v3');
assert.equal(installer.status, 'validation-pending');

for (const [file, marker] of [
  ['README.md', 'https://galusperes.github.io/#device-support'],
  ['docs/index.md', '| Guition JC4880P443 | 4.3" / 480×800 |'],
  ['docs/index.md', 'Support details for Guition JC4880P443'],
  ['RELEASING.md', '42 binaries'],
]) {
  requireMarker(read(file), marker, `${file} release documentation`);
}

const hardwareIoSource = read(`${base}/hardware_io_profile.h`);
const expectedHardwareIoGpios = [28, 29, 30, 31, 32, 33, 34, 49, 50, 51, 52];
const gpioEntries = [...hardwareIoSource.matchAll(/\{\s*(\d+)\s*,/g)].map((entry) => Number(entry[1]));
assert.deepEqual(gpioEntries, expectedHardwareIoGpios);
for (const gpio of expectedHardwareIoGpios) {
  requireMarker(hardwareIoSource, `{${gpio}, Device::kHardwareIoPinSwitch | Device::kHardwareIoPinTemperature,`, `hardware I/O GPIO ${gpio} capabilities`);
  requireMarker(hardwareIoSource, `"Expand GPIO ${gpio}"`, `hardware I/O GPIO ${gpio} label`);
}
assert.ok(!hardwareIoSource.includes(`kHardwareIoPinOnboard`), `onboard capability must stay absent`);
assert.ok(!hardwareIoSource.includes(`HardwareIoOutputLogic`), `output logic must stay absent`);
const reservedHardwareIoGpios = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 53, 54];
for (const gpio of reservedHardwareIoGpios) {
  assert.ok(!gpioEntries.includes(gpio), `reserved GPIO ${gpio} must stay absent`);
  assert.ok(!new RegExp(`\\{\\s*${gpio}\\s*,`).test(hardwareIoSource), `reserved GPIO ${gpio} entry must stay absent`);
}
requireMarker(profile, `#include "src/devices/guition_jc4880p443_portrait/hardware_io_profile.h"`, `hardware I/O header include`);
requireMarker(profile, `kHardwareIoProfile,`, `hardware I/O profile reference`);
assert.ok(!profile.includes(`kNoHardwareIoProfile`), `empty hardware I/O profile must be gone`);
const hardwareIoDocs = read(`docs/hardware-io.md`);
const hardwareIoDocRow = hardwareIoDocs.split(`\n`).find((line) => line.includes(`Guition JC4880P443`));
assert.ok(hardwareIoDocRow, `hardware I/O docs row is missing`);
const hardwareIoDocGpioSegment = hardwareIoDocRow.match(/GPIO\s+([\d,\s]+)/);
assert.ok(hardwareIoDocGpioSegment, `hardware I/O docs GPIO list is missing`);
const hardwareIoDocGpios = hardwareIoDocGpioSegment[1].split(`,`).map((part) => Number(part.trim())).filter((value) => Number.isInteger(value));
assert.deepEqual(hardwareIoDocGpios, expectedHardwareIoGpios);

console.log('Guition JC4880P443 portrait profile contract: PASS');
