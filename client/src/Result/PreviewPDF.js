import React, { useState } from 'react';
import { Dialog, Button, Flex } from '@radix-ui/themes';

const Modal = ({ showModal, setShowModal, pdfSrc }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <Dialog.Root open={showModal} onOpenChange={setShowModal} appearance="dark">
      <Dialog.Content color="violet">
        <Dialog.Title className="text-xl font-semibold mb-4 font-inter">PDF Preview</Dialog.Title>
        <Dialog.Description className="mb-4">Preview the PDF below.</Dialog.Description>
        <div style={{ width: '100%', height: '70vh', position: 'relative' }}>
          {isLoading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.1)', // Optional: semi-transparent background for loading state
              }}
            >
              Loading...
            </div>
          )}
          <iframe
            src={pdfSrc}
            style={{ width: '100%', height: '100%', border: 'none', display: isLoading ? 'none' : 'block' }}
            title="PDF Preview"
            onLoad={handleLoad}
          />
        </div>
        <Flex justify="end" mt="4">
          <Dialog.Close asChild>
            <Button variant="soft" color="gray">Close</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default Modal;