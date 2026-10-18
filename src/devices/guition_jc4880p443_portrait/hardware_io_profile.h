#pragma once

#include "src/devices/hardware_io_profile.h"

namespace DeviceGuitionJC4880P443PortraitProfile {

// Pins exposed by the 2x13 "Expand IO" header (JP1). GPIO35 (BOOT), the shared
// I2C bus and the ESP32-C6 UART/boot lines on the same header, and the GPIO26/27
// RS485 connector are deliberately absent.
inline constexpr Device::HardwareIoPinOption kHardwareIoPins[] = {
    {28, Device::kHardwareIoPinSwitch | Device::kHardwareIoPinTemperature,
     "Expand GPIO 28"},
    {29, Device::kHardwareIoPinSwitch | Device::kHardwareIoPinTemperature,
     "Expand GPIO 29"},
    {30, Device::kHardwareIoPinSwitch | Device::kHardwareIoPinTemperature,
     "Expand GPIO 30"},
    {31, Device::kHardwareIoPinSwitch | Device::kHardwareIoPinTemperature,
     "Expand GPIO 31"},
    {32, Device::kHardwareIoPinSwitch | Device::kHardwareIoPinTemperature,
     "Expand GPIO 32"},
    {33, Device::kHardwareIoPinSwitch | Device::kHardwareIoPinTemperature,
     "Expand GPIO 33"},
    {34, Device::kHardwareIoPinSwitch | Device::kHardwareIoPinTemperature,
     "Expand GPIO 34"},
    {49, Device::kHardwareIoPinSwitch | Device::kHardwareIoPinTemperature,
     "Expand GPIO 49"},
    {50, Device::kHardwareIoPinSwitch | Device::kHardwareIoPinTemperature,
     "Expand GPIO 50"},
    {51, Device::kHardwareIoPinSwitch | Device::kHardwareIoPinTemperature,
     "Expand GPIO 51"},
    {52, Device::kHardwareIoPinSwitch | Device::kHardwareIoPinTemperature,
     "Expand GPIO 52"},
};

inline constexpr Device::HardwareIoProfile kHardwareIoProfile =
    Device::makeHardwareIoProfile(kHardwareIoPins);

}  // namespace DeviceGuitionJC4880P443PortraitProfile
