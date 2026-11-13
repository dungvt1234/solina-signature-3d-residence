"""
AUTO FIX FULL - Chạy ngầm qua Blender background mode
Fix denoising + material preview + save file mới
"""
import bpy
import sys
import os

print("=" * 60)
print("AUTO FIX: Bắt đầu xử lý...")
print("=" * 60)

scene = bpy.context.scene

# === 1. CYCLES DENOISING ===
scene.render.engine = 'CYCLES'
scene.cycles.use_preview_denoising = True
try:
    scene.cycles.preview_denoiser = 'OPENIMAGEDENOISE'
    print("✅ Intel OIDN denoiser: ON")
except:
    scene.cycles.preview_denoiser = 'OPTIX'
    print("✅ OptiX denoiser: ON")

scene.cycles.preview_denoising_start_sample = 1
scene.cycles.preview_samples = 32
scene.cycles.samples = 256
scene.cycles.use_preview_adaptive_sampling = True
scene.cycles.preview_adaptive_threshold = 0.05

# === 2. VIEW LAYER - bật denoising passes ===
vl = scene.view_layers[0]
try:
    vl.use_pass_denoising = True
    print("✅ Denoising passes: ON")
except AttributeError:
    pass

# === 3. COMPOSITE NODE DENOISING ===
scene.use_nodes = True
tree = scene.node_tree

rl = next((n for n in tree.nodes if n.type == 'R_LAYERS'), None)
if not rl:
    rl = tree.nodes.new('CompositorNodeRLayers')
    rl.location = (-400, 300)

dn = next((n for n in tree.nodes if n.type == 'DENOISE'), None)
if not dn:
    dn = tree.nodes.new('CompositorNodeDenoise')
    dn.location = (100, 300)
dn.use_hdr = True

comp = next((n for n in tree.nodes if n.type == 'COMPOSITE'), None)
if not comp:
    comp = tree.nodes.new('CompositorNodeComposite')
    comp.location = (500, 300)

# Xóa links cũ đến Composite
for link in list(tree.links):
    if link.to_node == comp:
        tree.links.remove(link)

# Kết nối denoising chain
tree.links.new(rl.outputs['Image'], dn.inputs['Image'])
try:
    tree.links.new(rl.outputs['Denoising Normal'], dn.inputs['Normal'])
    tree.links.new(rl.outputs['Denoising Albedo'], dn.inputs['Albedo'])
    print("✅ Denoising Normal + Albedo passes: connected")
except:
    print("⚠️  Normal/Albedo passes not available, using RGB only")
tree.links.new(dn.outputs['Image'], comp.inputs['Image'])
print("✅ Composite denoise node: connected")

# === 4. VIEWPORT SHADING → Material Preview ===
switched = 0
for workspace in bpy.data.workspaces:
    for screen in workspace.screens:
        for area in screen.areas:
            if area.type == 'VIEW_3D':
                for space in area.spaces:
                    if space.type == 'VIEW_3D':
                        space.shading.type = 'MATERIAL'
                        space.shading.use_scene_lights = True
                        space.shading.use_scene_world = False
                        space.shading.studio_light = 'forest.exr'
                        switched += 1
print(f"✅ Switched {switched} viewport(s) to Material Preview")

# === 5. WORLD HDRI LIGHTING ===
world = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
scene.world = world
world.use_nodes = True
wt = world.node_tree

# Tìm hoặc tạo Background + Env Texture
bg = next((n for n in wt.nodes if n.type == 'BACKGROUND'), None)
if not bg:
    bg = wt.nodes.new('ShaderNodeBackground')
    bg.location = (200, 300)

env = next((n for n in wt.nodes if n.type == 'TEX_ENVIRONMENT'), None)
if not env:
    env = wt.nodes.new('ShaderNodeTexEnvironment')
    env.location = (-200, 300)

# Tìm HDR file
hdr_paths = [
    r"C:\Users\DELL\antigravity\Solina-Signature-B.11.17-—-3D-POV-Residence\public\textures\hdr\coastal_sunrise.hdr",
    r"D:\01_Workspace\assets\coastal_sunrise.hdr",
]
hdr_loaded = False
for hdr_path in hdr_paths:
    if os.path.exists(hdr_path):
        try:
            img = bpy.data.images.load(hdr_path, check_existing=True)
            env.image = img
            if 'Vector' in env.outputs and 'Color' in bg.inputs:
                pass
            wt.links.new(env.outputs['Color'], bg.inputs['Color'])
            bg.inputs['Strength'].default_value = 1.5
            print(f"✅ HDRI loaded: {hdr_path}")
            hdr_loaded = True
            break
        except Exception as e:
            print(f"⚠️  HDRI load error: {e}")

if not hdr_loaded:
    bg.inputs['Color'].default_value = (0.5, 0.6, 0.7, 1.0)
    bg.inputs['Strength'].default_value = 2.0
    print("⚠️  HDRI not found, using sky color fallback")

# Output node
out = next((n for n in wt.nodes if n.type == 'OUTPUT_WORLD'), None)
if not out:
    out = wt.nodes.new('ShaderNodeOutputWorld')
    out.location = (500, 300)
wt.links.new(bg.outputs['Background'], out.inputs['Surface'])

# === 6. SAVE FILE ===
save_path = r"D:\01_Workspace\SOLLINA_Signature_CLEAN_NoNoise.blend"
try:
    bpy.ops.wm.save_as_mainfile(filepath=save_path)
    print(f"✅ Saved: {save_path}")
except Exception as e:
    # Fallback save
    fallback = r"C:\Users\DELL\antigravity\Solina-Signature-B.11.17-—-3D-POV-Residence\SOLLINA_CLEAN.blend"
    bpy.ops.wm.save_as_mainfile(filepath=fallback)
    print(f"✅ Saved to fallback: {fallback}")

print("=" * 60)
print("🎉 HOÀN THÀNH! Mở file mới trong Blender để thấy kết quả.")
print("   - Viewport: Material Preview (KHÔNG nhiễu)")
print("   - Denoising: Intel OIDN (khi Rendered)")
print("   - HDRI: Coastal Sunrise")
print("=" * 60)
