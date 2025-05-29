import os

def bring_app_to_front(app_name="Internxt Drive"):
 
    print(f"Bringing '{app_name}' to front...")

    os.system(f'osascript -e \'tell application "{app_name}" to activate\'')
    print(f"'{app_name}' is now active.")