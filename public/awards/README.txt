Drop your news-segment videos in this folder (.mp4 is best; .webm, .mov and .m4v also work).
They show up on /awards automatically after you commit and redeploy.

Optional extras
- Thumbnail: add an image with the same name, e.g. my-clip.mp4 + my-clip.jpg (or .png / .webp).
- Title / channel / date: add an entry to captions.json using the exact video file name.
  If there is no entry, the title is made from the file name ("my-news-clip.mp4" -> "My news clip").
- Order: videos are sorted by file name, so start names with 01-, 02-, ... to control the order.

GitHub rejects files over 100 MB, so compress long clips first (HandBrake, 720p is plenty).
