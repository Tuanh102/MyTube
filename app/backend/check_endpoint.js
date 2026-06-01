async function check() {
  const videoId = '6a1be300f508793566a10ca9';
  const userA = '6a1be3a8f508793566a10d29'; // Trần Tuấn (purchased)
  const userB = '6a1be2acf508793566a10c6d'; // Tuanh102 (not purchased)

  console.log('Testing for User A (purchased):');
  try {
    const res = await fetch(`http://127.0.0.1:5000/videos/${videoId}?userId=${userA}`);
    const data = await res.json();
    console.log('Video URL:', data.video?.video_url);
  } catch (err) {
    console.error(err.message);
  }

  console.log('\nTesting for User B (not purchased):');
  try {
    const res = await fetch(`http://127.0.0.1:5000/videos/${videoId}?userId=${userB}`);
    const data = await res.json();
    console.log('Video URL:', data.video?.video_url);
  } catch (err) {
    console.error(err.message);
  }
}

check();
