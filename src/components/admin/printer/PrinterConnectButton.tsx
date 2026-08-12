import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BluetoothIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  PrinterIcon,
} from '@hugeicons/core-free-icons';

interface PrinterConnectButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'xs';
  showLabelOnMobile?: boolean;
}

export function PrinterConnectButton({
  variant = 'default',
  size = 'sm',
  showLabelOnMobile = true,
}: PrinterConnectButtonProps) {
  const { status, device, isSupported, connect, disconnect } = useBluetoothPrinter();

  if (!isSupported) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className="border-destructive/30 text-destructive text-xs gap-1.5 rounded-md cursor-not-allowed opacity-80"
      >
        <HugeiconsIcon icon={AlertCircleIcon} size={14} />
        <span className={showLabelOnMobile ? 'inline' : 'hidden sm:inline'}>
          Bluetooth Unsupported
        </span>
      </Button>
    );
  }

  if (status === 'connected') {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={disconnect}
        className="border-success/40 text-success hover:border-destructive hover:text-destructive text-xs font-semibold rounded-md gap-1.5 transition-colors"
      >
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
        <span className={showLabelOnMobile ? 'inline' : 'hidden sm:inline'}>
          {device?.name || 'Printer Connected'}
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={connect}
      disabled={status === 'connecting'}
      className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-md gap-1.5 shadow-xs"
    >
      {status === 'connecting' ? (
        <>
          <HugeiconsIcon icon={PrinterIcon} size={14} className="animate-pulse" />
          <span className={showLabelOnMobile ? 'inline' : 'hidden sm:inline'}>Connecting...</span>
        </>
      ) : (
        <>
          <HugeiconsIcon icon={BluetoothIcon} size={14} />
          <span className={showLabelOnMobile ? 'inline' : 'hidden sm:inline'}>
            {status === 'error' ? 'Reconnect Printer' : 'Connect Printer'}
          </span>
        </>
      )}
    </Button>
  );
}
