import cv2
import numpy as np
import math
import subprocess
import os

input_path = r"C:\Users\Omar\Downloads\Gold_ribbons_flowing_around_statues_202608091148 (1).mp4"
output_mp4 = r"public\story_bg.mp4"
output_webm = r"public\story_bg.webm"
output_mob_mp4 = r"public\story_bg_mobile.mp4"
output_mob_webm = r"public\story_bg_mobile.webm"

cap = cv2.VideoCapture(input_path)
frames = []
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(frame)
cap.release()

total_src_frames = len(frames)
print(f"Loaded {total_src_frames} source frames.")

# Target settings
# 65% slowdown: 4.0s * 1.65 = 6.6s per pass (13.2s total loop)
target_fps = 60
pass_duration = 6.6  # seconds
num_pass_frames = int(pass_duration * target_fps)  # 396 frames

height, width, _ = frames[0].shape

# Start FFmpeg process piping raw bgr24 frames to libx264 60fps MP4
cmd_mp4 = [
    'ffmpeg', '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-s', f'{width}x{height}',
    '-pix_fmt', 'bgr24',
    '-r', str(target_fps),
    '-i', '-',
    '-an',
    '-movflags', '+faststart',
    '-c:v', 'libx264',
    '-crf', '17',
    '-preset', 'slow',
    '-pix_fmt', 'yuv420p',
    output_mp4
]

pipe_mp4 = subprocess.Popen(cmd_mp4, stdin=subprocess.PIPE)

# Forward pass with cosine easing
print("Processing 65% slowed forward pass...")
for i in range(num_pass_frames):
    u = i / (num_pass_frames - 1)
    s = (1.0 - math.cos(math.pi * u)) / 2.0
    src_idx = s * (total_src_frames - 1)
    
    idx_floor = int(math.floor(src_idx))
    idx_ceil = min(idx_floor + 1, total_src_frames - 1)
    weight = src_idx - idx_floor
    
    frame1 = frames[idx_floor].astype(np.float32)
    frame2 = frames[idx_ceil].astype(np.float32)
    blended = cv2.addWeighted(frame1, 1.0 - weight, frame2, weight, 0).astype(np.uint8)
    pipe_mp4.stdin.write(blended.tobytes())

# Backward pass with cosine easing
print("Processing 65% slowed backward pass...")
for i in range(num_pass_frames):
    u = i / (num_pass_frames - 1)
    s = (1.0 + math.cos(math.pi * u)) / 2.0
    src_idx = s * (total_src_frames - 1)
    
    idx_floor = int(math.floor(src_idx))
    idx_ceil = min(idx_floor + 1, total_src_frames - 1)
    weight = src_idx - idx_floor
    
    frame1 = frames[idx_floor].astype(np.float32)
    frame2 = frames[idx_ceil].astype(np.float32)
    blended = cv2.addWeighted(frame1, 1.0 - weight, frame2, weight, 0).astype(np.uint8)
    pipe_mp4.stdin.write(blended.tobytes())

pipe_mp4.stdin.close()
pipe_mp4.wait()
print(f"Successfully generated 65% slowed 60fps MP4: {output_mp4}")

# Now generate WebM and Mobile variants using FFmpeg
print("Generating WebM and Mobile formats...")
subprocess.run(['ffmpeg', '-y', '-i', output_mp4, '-an', '-c:v', 'libvpx-vp9', '-b:v', '2.5M', output_webm], check=True)
subprocess.run(['ffmpeg', '-y', '-i', output_mp4, '-vf', 'scale=768:-2', '-an', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', output_mob_mp4], check=True)
subprocess.run(['ffmpeg', '-y', '-i', output_mp4, '-vf', 'scale=768:-2', '-an', '-c:v', 'libvpx-vp9', '-b:v', '1.2M', output_mob_webm], check=True)

print("ALL 65% SLOWED VIDEO VARIANTS GENERATED SUCCESSFULLY!")
