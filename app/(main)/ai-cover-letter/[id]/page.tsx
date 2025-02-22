import React from 'react';

interface UserAiCoverLetterParams {
  id: string; // Assuming 'id' is always a string
}

interface UserAiCoverLetterProps {
  params: UserAiCoverLetterParams;
}


export default async function UserAiCoverLetter({ params }: UserAiCoverLetterProps) {
  const id = params.id;

  return (
    <div>
      <h1>AI Cover Letter</h1>
      <p>AI Cover Letter Page {id}</p>
    </div>
  );
}