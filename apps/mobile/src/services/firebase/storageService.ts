import storage from '@react-native-firebase/storage';

export async function uploadPdfToFirebaseStorage({
  filePath,
  pdfId,
  userId,
}: {
  filePath: string;
  pdfId: string;
  userId: string;
}): Promise<string> {
  const storagePath = `users/${userId}/pdfs/${pdfId}.pdf`;
  const reference = storage().ref(storagePath);

  await reference.putFile(filePath);
  return reference.getDownloadURL();
}
