export interface Settings {
  general: {
    shuffleQuestions: boolean; // Shuffle question order
    allowRetake: boolean; // Allow students to retake the test
  };
  security: {
    enableTabSwitching: boolean; // Enable proctoring (e.g., webcam monitoring)
    restrictIp: boolean; // Restrict test to specific IP addresses
    disableCopyPaste: boolean; // Prevent copy-paste during test
  };
  users: {
    usersAdded: boolean;
    uploadedFiles = [];
  };
}
