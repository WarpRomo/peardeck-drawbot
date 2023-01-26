from ctypes import windll, Structure, c_long, byref
import win32gui

class POINT(Structure):
    _fields_ = [("x", c_long), ("y", c_long)]


def MousePosition_win32gui():
    flags, hcursor, (x,y) = win32gui.GetCursorInfo()
    return (x,y)

while True:
    print(MousePosition_win32gui());
