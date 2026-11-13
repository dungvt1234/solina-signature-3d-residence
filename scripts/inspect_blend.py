import bpy

# Load the file
filepath = r"D:\01_Workspace\SOLLINA_CLEAN_NoNoise.blend"
bpy.ops.wm.open_mainfile(filepath=filepath)

print("=== OBJECTS IN SCENE ===")
for obj in bpy.data.objects:
    print(f"- {obj.name} (type: {obj.type}, loc: {obj.location})")
print("=== TOTAL OBJECTS ===", len(bpy.data.objects))
