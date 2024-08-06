import React, { useState, useEffect } from 'react';
import { Dialog, Button, Flex } from '@radix-ui/themes';

const LyricModal = ({ showModal, setShowModal, lyricSrc }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [lyricAcc, setLyricAcc] = useState([]);

  useEffect(() => {
    const fetchLyrics = async () => {
      try {
        const response = await fetch(lyricSrc);
        const data = await response.json();
        setLyricAcc(data.lyrics_array);
        setIsLoading(false);
        console.log(data.lyrics_array, lyricAcc);
      } catch (error) {
        console.error('Error fetching lyrics:', error);
      }
    };

    fetchLyrics();
  }, [lyricSrc]);

  return (
    <Dialog.Root open={showModal} onOpenChange={setShowModal} appearance="dark">
      <Dialog.Content color="violet">
        <Dialog.Title className="text-xl font-semibold mb-4 font-inter">Lyrics</Dialog.Title>
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
            {lyricAcc.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
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

export default LyricModal;