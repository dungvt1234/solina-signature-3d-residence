"""
Fix Blender viewport noise - Enable Intel OIDN Denoising + Material Preview
Chạy script này trong Blender: Scripting tab -> Open -> Run Script
"""
import bpy

scene = bpy.context.scene

# === 1. CYCLES SETTINGS - Giảm noise tối đa ===
scene.render.engine = 'CYCLES'

# Viewport denoising
scene.cycles.use_preview_denoising = True
scene.cycles.preview_denoiser = 'OPENIMAGEDENOISE'  # Intel OIDN - tốt nhất
scene.cycles.preview_denoising_start_sample = 1    # Bắt đầu denoise từ sample 1
scene.cycles.preview_denoising_input_passes = 'RGB_ALBEDO_NORMAL'

# Giảm sample xuống thấp nhưng denoise bù lại
scene.cycles.preview_samples = 16   # Chỉ 16 samples, denoise sẽ làm sạch
scene.cycles.samples = 128           # Final render

# Noise threshold
scene.cycles.use_preview_adaptive_sampling = True
scene.cycles.preview_adaptive_threshold = 0.05

# === 2. DENOISING NODE trong Render ===
scene.use_nodes = True
tree = scene.node_tree

# Tìm Render Layers node
rl = None
for node in tree.nodes:
    if node.type == 'R_LAYERS':
        rl = node
        break

if rl is None:
    rl = tree.nodes.new('CompositorNodeRLayers')
    rl.location = (-300, 0)

# Tìm hoặc tạo Denoise node
dn = None
for node in tree.nodes:
    if node.type == 'DENOISE':
        dn = node
        break

if dn is None:
    dn = tree.nodes.new('CompositorNodeDenoise')
    dn.location = (100, 0)

# Bật HDR mode cho Denoise node
dn.use_hdr = True

# Tìm Composite output
comp = None
for node in tree.nodes:
    if node.type == 'COMPOSITE':
        comp = node
        break

if comp is None:
    comp = tree.nodes.new('CompositorNodeComposite')
    comp.location = (400, 0)

# Kết nối: Render Layers → Denoise → Composite
# Xóa links cũ đến Composite
for link in list(tree.links):
    if link.to_node == comp:
        tree.links.remove(link)

# Kết nối mới
tree.links.new(rl.outputs['Image'], dn.inputs['Image'])
if 'Denoising Normal' in rl.outputs:
    tree.links.new(rl.outputs['Denoising Normal'], dn.inputs['Normal'])
if 'Denoising Albedo' in rl.outputs:
    tree.links.new(rl.outputs['Denoising Albedo'], dn.inputs['Albedo'])
tree.links.new(dn.outputs['Image'], comp.inputs['Image'])

# === 3. Bật Denoising Data pass ===
vl = scene.view_layers[0]
vl.use_pass_denoising = True  # Blender 3.x+

# === 4. Chuyển tất cả viewports sang Material Preview (bớt nhiễu hơn Rendered) ===
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        for space in area.spaces:
            if space.type == 'VIEW_3D':
                # Material Preview = MATERIAL, Rendered = RENDERED
                space.shading.type = 'MATERIAL'
                space.shading.use_scene_lights = True
                space.shading.use_scene_world = True
                # Studio light quality
                space.shading.studio_light = 'forest.exr'

print("✅ DONE! Denoising enabled + switched to Material Preview mode")
print("   - Intel OIDN denoiser: ON")
print("   - Preview samples: 16 (denoise compensates)")  
print("   - Viewport: Material Preview (no grain!)")
print("   - Composite denoise node: connected")
print("")
print("   Nếu vẫn muốn Rendered mode: nhấn Z → Rendered")
print("   Nhưng Material Preview đã rất đẹp và KHÔNG bị nhiễu!")
