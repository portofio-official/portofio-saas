import fs from 'fs';
const src = '/Users/masman/.gemini/antigravity-ide/brain/f3e5d4f2-795b-4190-9d7f-c118394c4fcf/profile_option_1_white_gradient_1784553982530.png';
const dest = 'public/profile.png';
try {
  fs.copyFileSync(src, dest);
  console.log('Successfully copied the image!');
} catch (err) {
  console.error('Error copying image:', err);
}
