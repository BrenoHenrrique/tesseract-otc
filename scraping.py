import pyautogui
import time

x = 1

pyautogui.hotkey('alt', 'tab')

while x < 140:
    url = f"https://sereduc.blackboard.com/courses/1/7.5268.64782/content/_4805981_1/contents/ebook/p{x}.jpg"
    pyautogui.moveTo(500, 50)
    pyautogui.click()
    pyautogui.write(url)
    pyautogui.press('enter')
    time.sleep(1)
    pyautogui.moveTo(800, 450)
    pyautogui.click(button='right')
    pyautogui.moveTo(805, 485)
    pyautogui.click()
    time.sleep(1)
    pyautogui.press('enter')
    x += 1
    print(x)