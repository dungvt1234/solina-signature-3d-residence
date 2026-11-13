"""
Script chạy trong Blender Scripting tab:
- Fix denoising
- Material Preview
- HDRI lighting  
- Save file sạch
"""
import bpy, os

scene = bpy.context.scene

# 1. Denoising
scene.render.engine = 'CYCLES'
scene.cycles.use_preview_denoising = True
scene.cycles.preview_samples = 32
try:
    scene.cycles.preview_denoiser = 'OPENIMAGEDENOISE'
except: pass

# 2. Viewport → Material Preview (không nhiễu)
for window in bpy.context.window_manager.windows:
    for area in window.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    space.shading.type = 'MATERIAL'
                    space.shading.use_scene_lights = True

# 3. HDRI World
world = scene.world or bpy.data.worlds.new('World')
scene.world = world
world.use_nodes = True
wt = world.node_tree
wt.nodes.clear()
out = wt.nodes.new('ShaderNodeOutputWorld')
bg  = wt.nodes.new('ShaderNodeBackground')
env = wt.nodes.new('ShaderNodeTexEnvironment')
bg.inputs['Strength'].default_value = 1.5
out.location = (500,300); bg.location=(200,300); env.location=(-200,300)

hdr = r"C:\Users\DELL\antigravity\Solina-Signature-B.11.17-—-3D-POV-Residence\public\textures\hdr\coastal_sunrise.hdr"
if os.path.exists(hdr):
    env.image = bpy.data.images.load(hdr, check_existing=True)
    wt.links.new(env.outputs['Color'], bg.inputs['Color'])
else:
    bg.inputs['Color'].default_value = (0.5,0.65,0.8,1.0)
wt.links.new(bg.outputs['Background'], out.inputs['Surface'])

# 4. Save
bpy.ops.wm.save_as_mainfile(filepath=r"D:\01_Workspace\SOLLINA_CLEAN_NoNoise.blend")
print("✅ SAVED: SOLLINA_CLEAN_NoNoise.blend")
