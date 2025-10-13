import React from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

const ExampleModal = NiceModal.create(({ message = 'This is a NiceModal + shadcn/ui modal!' }: { message?: string }) => {
  const modal = useModal();
  return (
    <Dialog>
      <DialogContent>
        <DialogTitle>Example Modal</DialogTitle>
        <p className="mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => modal.hide()}>Cancel</Button>
          <Button onClick={() => { modal.resolve('confirmed'); modal.hide(); }}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default ExampleModal; 