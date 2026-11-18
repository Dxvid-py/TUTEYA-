import { ExternalLink, ShieldCheck, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function VideoRoomDialog({
  roomUrl,
  title,
  onClose,
}: {
  roomUrl: string | null;
  title: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!roomUrl} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl overflow-hidden p-0">
        <DialogHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Video className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold">{title}</DialogTitle>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-emerald-500" /> Sala virtual integrada de TUTEYA (Jitsi Meet HD)
              </p>
            </div>
          </div>
          {roomUrl && (
            <Button asChild size="sm" variant="outline" className="mr-6 rounded-full">
              <a href={roomUrl} target="_blank" rel="noreferrer">
                Abrir en pestaña nueva <ExternalLink className="size-3.5" />
              </a>
            </Button>
          )}
        </DialogHeader>
        {roomUrl && (
          <div className="aspect-video w-full bg-black">
            <iframe
              src={`${roomUrl}#config.prejoinPageEnabled=false&interfaceConfig.SHOW_JITSI_WATERMARK=false`}
              title={title}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="h-full w-full border-0"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
