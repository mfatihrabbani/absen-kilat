/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Ikon Phosphor yang dipakai aplikasi (sama dengan `ph:*` di desain).
 * Diimpor per-ikon supaya bundle tidak memuat seluruh set Phosphor; memakai
 * `require` agar `tsc` tidak ikut memeriksa sumber .tsx milik paket.
 */
import type { Icon } from 'phosphor-react-native';

export type { Icon, IconProps } from 'phosphor-react-native';

export const ArrowCounterClockwiseIcon: Icon =
  require('phosphor-react-native/src/icons/ArrowCounterClockwise').ArrowCounterClockwiseIcon;
export const ArrowDownLeftIcon: Icon =
  require('phosphor-react-native/src/icons/ArrowDownLeft').ArrowDownLeftIcon;
export const ArrowUpRightIcon: Icon =
  require('phosphor-react-native/src/icons/ArrowUpRight').ArrowUpRightIcon;
export const BriefcaseIcon: Icon =
  require('phosphor-react-native/src/icons/Briefcase').BriefcaseIcon;
export const CalendarBlankIcon: Icon =
  require('phosphor-react-native/src/icons/CalendarBlank').CalendarBlankIcon;
export const CalendarDotsIcon: Icon =
  require('phosphor-react-native/src/icons/CalendarDots').CalendarDotsIcon;
export const CalendarXIcon: Icon =
  require('phosphor-react-native/src/icons/CalendarX').CalendarXIcon;
export const CameraIcon: Icon = require('phosphor-react-native/src/icons/Camera').CameraIcon;
export const CameraRotateIcon: Icon =
  require('phosphor-react-native/src/icons/CameraRotate').CameraRotateIcon;
export const CaretLeftIcon: Icon =
  require('phosphor-react-native/src/icons/CaretLeft').CaretLeftIcon;
export const CaretRightIcon: Icon =
  require('phosphor-react-native/src/icons/CaretRight').CaretRightIcon;
export const CheckCircleIcon: Icon =
  require('phosphor-react-native/src/icons/CheckCircle').CheckCircleIcon;
export const CheckIcon: Icon = require('phosphor-react-native/src/icons/Check').CheckIcon;
export const ClockCountdownIcon: Icon =
  require('phosphor-react-native/src/icons/ClockCountdown').ClockCountdownIcon;
export const ClockIcon: Icon = require('phosphor-react-native/src/icons/Clock').ClockIcon;
export const CoffeeIcon: Icon = require('phosphor-react-native/src/icons/Coffee').CoffeeIcon;
export const FingerprintIcon: Icon =
  require('phosphor-react-native/src/icons/Fingerprint').FingerprintIcon;
export const LightningIcon: Icon =
  require('phosphor-react-native/src/icons/Lightning').LightningIcon;
export const LightningSlashIcon: Icon =
  require('phosphor-react-native/src/icons/LightningSlash').LightningSlashIcon;
export const MapPinIcon: Icon = require('phosphor-react-native/src/icons/MapPin').MapPinIcon;
export const MinusIcon: Icon = require('phosphor-react-native/src/icons/Minus').MinusIcon;
export const PaperPlaneTiltIcon: Icon =
  require('phosphor-react-native/src/icons/PaperPlaneTilt').PaperPlaneTiltIcon;
export const SignInIcon: Icon = require('phosphor-react-native/src/icons/SignIn').SignInIcon;
export const SignOutIcon: Icon = require('phosphor-react-native/src/icons/SignOut').SignOutIcon;
export const TimerIcon: Icon = require('phosphor-react-native/src/icons/Timer').TimerIcon;
export const UserFocusIcon: Icon =
  require('phosphor-react-native/src/icons/UserFocus').UserFocusIcon;
export const UserIcon: Icon = require('phosphor-react-native/src/icons/User').UserIcon;
export const WarningCircleIcon: Icon =
  require('phosphor-react-native/src/icons/WarningCircle').WarningCircleIcon;
export const XIcon: Icon = require('phosphor-react-native/src/icons/X').XIcon;
