import tkinter as tk
root = tk.Tk()
root.withdraw()
img = tk.PhotoImage(file="tc22_27.png")
width = img.width()
height = img.height()

min_x, max_x = width, 0
min_y, max_y = height, 0

for y in range(int(height*0.2), int(height*0.8)):
    for x in range(int(width*0.2), int(width*0.8)):
        if img.transparency_get(x, y):
            if x < min_x: min_x = x
            if x > max_x: max_x = x
            if y < min_y: min_y = y
            if y > max_y: max_y = y

if max_x >= min_x:
    print(f"X: {min_x} to {max_x} -> Left: {min_x/width*100:.2f}%, Width: {(max_x-min_x+1)/width*100:.2f}%")
    print(f"Y: {min_y} to {max_y} -> Top: {min_y/height*100:.2f}%, Height: {(max_y-min_y+1)/height*100:.2f}%")
else:
    print("No transparent pixels found in the center region!")
