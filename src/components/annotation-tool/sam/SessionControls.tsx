import React, { useState } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { Label } from '@/components/ui/ui/label';
import { Badge } from '@/components/ui/ui/badge';
import { Power, PowerOff, Cpu, Zap, Settings2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/ui/alert-dialog';
import type { SAMModel, DeviceType, PrecisionType, ModelConfig } from '@/types/sam';

interface SessionControlsProps {
  isActive: boolean;
  isLoading: boolean;
  currentConfig?: ModelConfig;
  onStartSession: (config: ModelConfig) => void;
  onSwitchModel: (config: ModelConfig) => void;
  onEndSession: () => void;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  isActive,
  isLoading,
  currentConfig,
  onStartSession,
  onSwitchModel,
  onEndSession,
}) => {
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [model, setModel] = useState<SAMModel>('sam_v2');
  const [device, setDevice] = useState<DeviceType>('cuda');
  const [precision, setPrecision] = useState<PrecisionType>('fp16');

  const handleStart = () => {
    onStartSession({ model, device, precision });
  };

  const handleSwitch = () => {
    onSwitchModel({ model, device, precision });
    setShowSwitchDialog(false);
  };

  return (
    <div className="space-y-4 p-4 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Session Controls</h3>
        </div>
        {isActive && (
          <Badge variant="default" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Active
          </Badge>
        )}
      </div>

      {!isActive ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">AI Model</Label>
            <Select value={model} onValueChange={(v) => setModel(v as SAMModel)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sam_v1">SAM v1 (Legacy)</SelectItem>
                <SelectItem value="sam_v2">SAM v2 (Balanced)</SelectItem>
                <SelectItem value="sam_v3">SAM v3 (Advanced + Text)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-xs">Device</Label>
              <Select value={device} onValueChange={(v) => setDevice(v as DeviceType)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cuda">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      <span>CUDA</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="cpu">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-3 w-3" />
                      <span>CPU</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Precision</Label>
              <Select value={precision} onValueChange={(v) => setPrecision(v as PrecisionType)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fp16">FP16 (Fast)</SelectItem>
                  <SelectItem value="fp32">FP32 (Accurate)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleStart}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-primary/80"
          >
            <Power className="h-4 w-4 mr-2" />
            {isLoading ? 'Starting...' : 'Start AI Session'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="text-xs text-muted-foreground mb-1">Active Configuration</div>
            <div className="text-sm font-medium">
              {currentConfig?.model.toUpperCase()} ({currentConfig?.device.toUpperCase()}, {currentConfig?.precision.toUpperCase()})
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setShowSwitchDialog(true)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Settings2 className="h-3 w-3 mr-2" />
              Switch Model
            </Button>
            <Button
              onClick={onEndSession}
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:text-destructive"
            >
              <PowerOff className="h-3 w-3 mr-2" />
              End Session
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch AI Model?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all current suggestions and restart the AI session with the new model configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <Label className="text-xs">New Model</Label>
              <Select value={model} onValueChange={(v) => setModel(v as SAMModel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sam_v1">SAM v1 (Legacy)</SelectItem>
                  <SelectItem value="sam_v2">SAM v2 (Balanced)</SelectItem>
                  <SelectItem value="sam_v3">SAM v3 (Advanced + Text)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs">Device</Label>
                <Select value={device} onValueChange={(v) => setDevice(v as DeviceType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cuda">CUDA</SelectItem>
                    <SelectItem value="cpu">CPU</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Precision</Label>
                <Select value={precision} onValueChange={(v) => setPrecision(v as PrecisionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fp16">FP16</SelectItem>
                    <SelectItem value="fp32">FP32</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSwitch}>Switch Model</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
