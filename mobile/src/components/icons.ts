/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Ikon Phosphor yang dipakai aplikasi (sama dengan `ph:*` di desain).
 * Diimpor per-ikon supaya bundle tidak memuat seluruh set Phosphor; memakai
 * `require` agar `tsc` tidak ikut memeriksa sumber .tsx milik paket.
 */
import type { Icon } from 'phosphor-react-native';

export type { Icon, IconProps } from 'phosphor-react-native';

/** Ambil komponen ikon `<Nama>Icon` dari berkas ikon Phosphor. */
const load = (mod: Record<string, Icon>, name: string): Icon => mod[`${name}Icon`]!;

export const ArrowCounterClockwiseIcon = load(require('phosphor-react-native/src/icons/ArrowCounterClockwise'), 'ArrowCounterClockwise');
export const ArrowDownLeftIcon = load(require('phosphor-react-native/src/icons/ArrowDownLeft'), 'ArrowDownLeft');
export const ArrowUpRightIcon = load(require('phosphor-react-native/src/icons/ArrowUpRight'), 'ArrowUpRight');
export const BriefcaseIcon = load(require('phosphor-react-native/src/icons/Briefcase'), 'Briefcase');
export const CalendarBlankIcon = load(require('phosphor-react-native/src/icons/CalendarBlank'), 'CalendarBlank');
export const CalendarDotsIcon = load(require('phosphor-react-native/src/icons/CalendarDots'), 'CalendarDots');
export const CalendarXIcon = load(require('phosphor-react-native/src/icons/CalendarX'), 'CalendarX');
export const CameraIcon = load(require('phosphor-react-native/src/icons/Camera'), 'Camera');
export const CameraRotateIcon = load(require('phosphor-react-native/src/icons/CameraRotate'), 'CameraRotate');
export const CaretLeftIcon = load(require('phosphor-react-native/src/icons/CaretLeft'), 'CaretLeft');
export const CaretRightIcon = load(require('phosphor-react-native/src/icons/CaretRight'), 'CaretRight');
export const CheckCircleIcon = load(require('phosphor-react-native/src/icons/CheckCircle'), 'CheckCircle');
export const CheckIcon = load(require('phosphor-react-native/src/icons/Check'), 'Check');
export const ClockCountdownIcon = load(require('phosphor-react-native/src/icons/ClockCountdown'), 'ClockCountdown');
export const ClockIcon = load(require('phosphor-react-native/src/icons/Clock'), 'Clock');
export const CoffeeIcon = load(require('phosphor-react-native/src/icons/Coffee'), 'Coffee');
export const EnvelopeSimpleIcon = load(require('phosphor-react-native/src/icons/EnvelopeSimple'), 'EnvelopeSimple');
export const EnvelopeSimpleOpenIcon = load(require('phosphor-react-native/src/icons/EnvelopeSimpleOpen'), 'EnvelopeSimpleOpen');
export const EyeIcon = load(require('phosphor-react-native/src/icons/Eye'), 'Eye');
export const EyeSlashIcon = load(require('phosphor-react-native/src/icons/EyeSlash'), 'EyeSlash');
export const FingerprintIcon = load(require('phosphor-react-native/src/icons/Fingerprint'), 'Fingerprint');
export const ImagesIcon = load(require('phosphor-react-native/src/icons/Images'), 'Images');
export const InfoIcon = load(require('phosphor-react-native/src/icons/Info'), 'Info');
export const LightningIcon = load(require('phosphor-react-native/src/icons/Lightning'), 'Lightning');
export const LightningSlashIcon = load(require('phosphor-react-native/src/icons/LightningSlash'), 'LightningSlash');
export const LockKeyIcon = load(require('phosphor-react-native/src/icons/LockKey'), 'LockKey');
export const MapPinIcon = load(require('phosphor-react-native/src/icons/MapPin'), 'MapPin');
export const MinusIcon = load(require('phosphor-react-native/src/icons/Minus'), 'Minus');
export const PaperPlaneTiltIcon = load(require('phosphor-react-native/src/icons/PaperPlaneTilt'), 'PaperPlaneTilt');
export const SealCheckIcon = load(require('phosphor-react-native/src/icons/SealCheck'), 'SealCheck');
export const SignInIcon = load(require('phosphor-react-native/src/icons/SignIn'), 'SignIn');
export const SignOutIcon = load(require('phosphor-react-native/src/icons/SignOut'), 'SignOut');
export const TimerIcon = load(require('phosphor-react-native/src/icons/Timer'), 'Timer');
export const TrashIcon = load(require('phosphor-react-native/src/icons/Trash'), 'Trash');
export const UserFocusIcon = load(require('phosphor-react-native/src/icons/UserFocus'), 'UserFocus');
export const UserIcon = load(require('phosphor-react-native/src/icons/User'), 'User');
export const WarningCircleIcon = load(require('phosphor-react-native/src/icons/WarningCircle'), 'WarningCircle');
export const XIcon = load(require('phosphor-react-native/src/icons/X'), 'X');
