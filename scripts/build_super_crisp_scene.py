import bpy
import math
import os

def create_super_crisp_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene

    # 1. CYCLES & PREVIEW DENOISE SETTINGS
    scene.render.engine = 'CYCLES'
    try:
        cycles_prefs = bpy.context.preferences.addons['cycles'].preferences
        cycles_prefs.compute_device_type = 'CUDA'
        cycles_prefs.get_devices()
        scene.cycles.device = 'GPU'
    except Exception:
        scene.cycles.device = 'CPU'

    # BẬT KHỬ NHIỄU VIEWPORT VÀ RENDER SẴN TRONG FILE
    scene.cycles.use_preview_denoising = True
    scene.cycles.preview_samples = 32
    scene.cycles.samples = 64
    scene.cycles.use_denoising = True

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # 2. BẦU TRỜ NISHITA & ÁNH SÁNG CHAN HÒA
    world = scene.world
    if not world:
        world = bpy.data.worlds.new("Solina_Atmosphere")
        scene.world = world
    world.use_nodes = True
    wnodes = world.node_tree.nodes
    wlinks = world.node_tree.links
    wnodes.clear()

    hdr_path = os.path.join(base_dir, "public", "textures", "hdr", "coastal_sunrise.hdr")
    bg = wnodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = 1.35
    woutput = wnodes.new("ShaderNodeOutputWorld")

    if os.path.exists(hdr_path):
        env_node = wnodes.new("ShaderNodeTexEnvironment")
        env_node.image = bpy.data.images.load(hdr_path)
        wlinks.new(env_node.outputs["Color"], bg.inputs["Color"])
    else:
        sky = wnodes.new("ShaderNodeTexSky")
        sky.sky_type = 'MULTIPLE_SCATTERING'
        wlinks.new(sky.outputs["Color"], bg.inputs["Color"])

    wlinks.new(bg.outputs["Background"], woutput.inputs["Surface"])

    # 3. VẬT LIỆU PBR CAO CẤP
    def make_mat(name, color=(1, 1, 1, 1), roughness=0.5, metallic=0.0, coat=0.0, transmission=0.0):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        bsdf = nodes.get("Principled BSDF")
        if bsdf:
            if "Base Color" in bsdf.inputs: bsdf.inputs["Base Color"].default_value = color
            if "Roughness" in bsdf.inputs: bsdf.inputs["Roughness"].default_value = roughness
            if "Metallic" in bsdf.inputs: bsdf.inputs["Metallic"].default_value = metallic
            if "Coat Weight" in bsdf.inputs: bsdf.inputs["Coat Weight"].default_value = coat
            elif "Clearcoat" in bsdf.inputs: bsdf.inputs["Clearcoat"].default_value = coat
            if "Transmission Weight" in bsdf.inputs: bsdf.inputs["Transmission Weight"].default_value = transmission
            elif "Transmission" in bsdf.inputs: bsdf.inputs["Transmission"].default_value = transmission
        return mat

    mat_plaster = make_mat("Mat_Tuong_Plaster", color=(0.95, 0.93, 0.90, 1), roughness=0.88)
    mat_viglacera = make_mat("Mat_Gach_Viglacera_80x80", color=(0.99, 0.99, 1.0, 1), roughness=0.08, coat=1.0)
    mat_wood = make_mat("Mat_Lam_Go_3D", color=(0.76, 0.54, 0.34, 1), roughness=0.45)
    mat_sofa = make_mat("Mat_Vai_Sofa_Kem", color=(0.92, 0.89, 0.83, 1), roughness=0.9)
    mat_teal = make_mat("Mat_Goi_Xanh_Bien", color=(0.22, 0.45, 0.55, 1), roughness=0.8)
    mat_marble = make_mat("Mat_Da_Marble", color=(0.98, 0.97, 0.95, 1), roughness=0.12, coat=0.8)
    mat_glass = make_mat("Mat_Kinh_Cuong_Luc", color=(0.96, 0.98, 1.0, 1), roughness=0.01, transmission=1.0)
    mat_rattan = make_mat("Mat_May_Dan_Ban_Cong", color=(0.70, 0.54, 0.38, 1), roughness=0.8)

    # Thảm cỏ PBR
    mat_grass = bpy.data.materials.new(name="Mat_Co_San_Vuon_PBR")
    mat_grass.use_nodes = True
    gnodes = mat_grass.node_tree.nodes
    glinks = mat_grass.node_tree.links
    gbsdf = gnodes.get("Principled BSDF")
    if gbsdf:
        if "Roughness" in gbsdf.inputs: gbsdf.inputs["Roughness"].default_value = 0.90
        color_path = os.path.join(base_dir, "public", "textures", "grass", "grass_color.jpg")
        nor_path = os.path.join(base_dir, "public", "textures", "grass", "grass_nor.jpg")
        rough_path = os.path.join(base_dir, "public", "textures", "grass", "grass_rough.jpg")

        if os.path.exists(color_path):
            img_node = gnodes.new("ShaderNodeTexImage")
            img_node.image = bpy.data.images.load(color_path)
            img_node.location = (-400, 200)
            glinks.new(img_node.outputs["Color"], gbsdf.inputs["Base Color"])

        if os.path.exists(rough_path):
            rough_node = gnodes.new("ShaderNodeTexImage")
            rough_node.image = bpy.data.images.load(rough_path)
            rough_node.image.colorspace_settings.name = 'Non-Color'
            rough_node.location = (-400, -80)
            if "Roughness" in gbsdf.inputs:
                glinks.new(rough_node.outputs["Color"], gbsdf.inputs["Roughness"])

        if os.path.exists(nor_path):
            nor_img = gnodes.new("ShaderNodeTexImage")
            nor_img.image = bpy.data.images.load(nor_path)
            nor_img.image.colorspace_settings.name = 'Non-Color'
            nor_img.location = (-600, -320)
            nor_map = gnodes.new("ShaderNodeNormalMap")
            nor_map.location = (-300, -320)
            nor_map.inputs["Strength"].default_value = 0.85
            glinks.new(nor_img.outputs["Color"], nor_map.inputs["Color"])
            if "Normal" in gbsdf.inputs:
                glinks.new(nor_map.outputs["Normal"], gbsdf.inputs["Normal"])

    # 4. SÀN NHÀ & BAN CÔNG
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.7, 0))
    int_floor = bpy.context.active_object
    int_floor.name = "San_Gach_Viglacera_80x80"
    int_floor.scale = (12.24, 5.82, 1)
    int_floor.data.materials.append(mat_viglacera)

    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -3.0, 0.005))
    balc_floor = bpy.context.active_object
    balc_floor.name = "San_Ban_Cong_Co_Xanh"
    balc_floor.scale = (12.30, 1.60, 1)
    balc_floor.data.materials.append(mat_grass)

    # 5. HỆ VÁCH TƯỜNG KIẾN TRÚC
    WALL_HEIGHT = 2.95
    wall_segments = [
        {"x1": -6.2, "z1": 3.62, "x2": 4.95, "z2": 3.62, "th": 0.16, "mat": mat_plaster, "name": "Tuong_Nam_1"},
        {"x1": 5.9, "z1": 3.62, "x2": 6.2, "z2": 3.62, "th": 0.16, "mat": mat_plaster, "name": "Tuong_Nam_2"},
        {"x1": 6.12, "z1": -2.2, "x2": 6.12, "z2": 3.7, "th": 0.16, "mat": mat_plaster, "name": "Tuong_Dong"},
        {"x1": -6.12, "z1": -1.5, "x2": -6.12, "z2": 3.7, "th": 0.16, "mat": mat_plaster, "name": "Tuong_Tay"},
        {"x1": -6.12, "z1": 1.5, "x2": -3.38, "z2": 1.5, "th": 0.14, "mat": mat_plaster, "name": "Tuong_Tam_Master_Bac"},
        {"x1": -2.55, "z1": 1.5, "x2": -2.55, "z2": 3.62, "th": 0.14, "mat": mat_plaster, "name": "Tuong_Tam_Master_Dong"},
        {"x1": -2.42, "z1": -2.2, "x2": -2.42, "z2": 0.58, "th": 0.18, "mat": mat_plaster, "name": "Tuong_Ngu_Master_Dong"},
        {"x1": -2.35, "z1": 1.5, "x2": -1.58, "z2": 1.5, "th": 0.12, "mat": mat_plaster, "name": "Tuong_Tam_Chung_Bac"},
        {"x1": -0.78, "z1": 1.5, "x2": -0.78, "z2": 3.62, "th": 0.14, "mat": mat_plaster, "name": "Tuong_Tam_Chung_Dong"},
        {"x1": -2.22, "z1": -2.2, "x2": -2.22, "z2": 1.15, "th": 0.14, "mat": mat_plaster, "name": "Tuong_Ngu2_Tay"},
        {"x1": -2.22, "z1": 1.15, "x2": 0.42, "z2": 1.15, "th": 0.14, "mat": mat_plaster, "name": "Tuong_Ngu2_Nam"},
        {"x1": 1.38, "z1": -2.2, "x2": 1.38, "z2": 1.15, "th": 0.18, "mat": mat_plaster, "name": "Tuong_Ngu2_Dong"},
        {"x1": -2.95, "z1": -2.2, "x2": -2.42, "z2": -2.2, "th": 0.05, "mat": mat_glass, "name": "Kinh_Ngu_Master"},
        {"x1": -2.22, "z1": -2.2, "x2": -0.95, "z2": -2.2, "th": 0.05, "mat": mat_glass, "name": "Kinh_Ngu2_Trai"},
        {"x1": 0.85, "z1": -2.2, "x2": 1.38, "z2": -2.2, "th": 0.05, "mat": mat_glass, "name": "Kinh_Ngu2_Phai"},
        {"x1": 1.38, "z1": -2.2, "x2": 2.15, "z2": -2.2, "th": 0.05, "mat": mat_glass, "name": "Kinh_Khach_Trai"},
        {"x1": 4.95, "z1": -2.2, "x2": 6.12, "z2": -2.2, "th": 0.05, "mat": mat_glass, "name": "Kinh_Khach_Phai"},
        {"x1": 6.15, "z1": -3.76, "x2": 6.15, "z2": -2.2, "th": 0.04, "mat": mat_glass, "name": "Lan_Can_Dong"},
        {"x1": -4.05, "z1": -3.76, "x2": 6.15, "z2": -3.76, "th": 0.04, "mat": mat_glass, "name": "Lan_Can_Bac"},
    ]

    for w in wall_segments:
        dx = w["x2"] - w["x1"]
        dz = w["z2"] - w["z1"]
        length = math.hypot(dx, dz)
        angle = math.atan2(dz, dx)
        mx = (w["x1"] + w["x2"]) / 2
        mz = (w["z1"] + w["z2"]) / 2
        h = 1.15 if "Lan_Can" in w["name"] else WALL_HEIGHT

        bpy.ops.mesh.primitive_cube_add(size=1)
        wall_obj = bpy.context.active_object
        wall_obj.name = w["name"]
        wall_obj.scale = (length, w["th"], h)
        wall_obj.location = (mx, mz, h / 2)
        wall_obj.rotation_euler = (0, 0, -angle)
        wall_obj.data.materials.append(w["mat"])

    # 6. HỆ LAM GỖ 3D NỔI (98 NAN GỖ)
    slat_count = 98
    wall_len = 5.10
    start_z = 1.05 - wall_len / 2 + 0.026
    for i in range(slat_count):
        z = start_z + (i / (slat_count - 1)) * (wall_len - 0.052)
        bpy.ops.mesh.primitive_cube_add(size=1)
        slat = bpy.context.active_object
        slat.name = f"Nan_Go_3D_{i+1:02d}"
        slat.scale = (0.032, 0.034, 2.72)
        slat.location = (5.98, z, 1.38)
        slat.data.materials.append(mat_wood)

    # 7. NỘI THẤT CAO CẤP ĐẦY ĐỦ
    # Sofa phòng khách
    bpy.ops.mesh.primitive_cube_add(size=1, location=(3.80, -0.45, 0.42))
    sofa_base = bpy.context.active_object
    sofa_base.name = "Sofa_Khach"
    sofa_base.scale = (2.4, 0.95, 0.42)
    sofa_base.data.materials.append(mat_sofa)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(3.80, -0.05, 0.72))
    sofa_back = bpy.context.active_object
    sofa_back.name = "Sofa_Tua_Lung"
    sofa_back.scale = (2.4, 0.32, 0.65)
    sofa_back.data.materials.append(mat_sofa)

    # Bàn trà tròn đá marble
    bpy.ops.mesh.primitive_cylinder_add(radius=0.45, depth=0.38, location=(3.80, -1.05, 0.19))
    table = bpy.context.active_object
    table.name = "Ban_Tra_Marble"
    table.data.materials.append(mat_marble)

    # Đảo bếp đá Marble + tủ gỗ
    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.98, 3.22, 0.45))
    island_base = bpy.context.active_object
    island_base.name = "Dao_Bep_Tu_Go"
    island_base.scale = (2.8, 0.85, 0.88)
    island_base.data.materials.append(mat_wood)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.98, 3.22, 0.91))
    island_top = bpy.context.active_object
    island_top.name = "Mat_Da_Dao_Bep"
    island_top.scale = (2.9, 0.92, 0.06)
    island_top.data.materials.append(mat_marble)

    # Bàn ăn
    bpy.ops.mesh.primitive_cube_add(size=1, location=(3.65, 1.85, 0.74))
    dining_table = bpy.context.active_object
    dining_table.name = "Ban_An_Gia_Dinh"
    dining_table.scale = (1.8, 0.9, 0.05)
    dining_table.data.materials.append(mat_wood)

    # Giường ngủ King Master
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-4.35, -0.45, 0.32))
    bed_base = bpy.context.active_object
    bed_base.name = "Giuong_Ngu_Master"
    bed_base.scale = (1.9, 2.1, 0.45)
    bed_base.data.materials.append(mat_sofa)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(-4.35, 0.62, 0.68))
    headboard = bpy.context.active_object
    headboard.name = "Vach_Dau_Giuong"
    headboard.scale = (2.2, 0.18, 1.15)
    headboard.data.materials.append(mat_wood)

    # Ghế mây ban công trên thảm cỏ
    bpy.ops.mesh.primitive_cylinder_add(radius=0.38, depth=0.45, location=(-0.55, -3.05, 0.23))
    rattan1 = bpy.context.active_object
    rattan1.name = "Ghe_May_1"
    rattan1.data.materials.append(mat_rattan)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.38, depth=0.45, location=(0.65, -3.05, 0.23))
    rattan2 = bpy.context.active_object
    rattan2.name = "Ghe_May_2"
    rattan2.data.materials.append(mat_rattan)

    # 8. ÁNH SÁNG MẶT TRỜI MỀM MẠI
    bpy.ops.object.light_add(type='SUN', location=(10, -18, 12))
    sun = bpy.context.active_object
    sun.name = "Den_Mat_Troi"
    sun.data.energy = 4.0
    sun.data.angle = math.radians(1.5)
    sun.data.color = (1.0, 0.94, 0.85)
    sun.rotation_euler = (math.radians(45), math.radians(15), math.radians(-35))

    # 9. CAMERA POV PHÒNG KHÁCH
    bpy.ops.object.camera_add(location=(2.35, 0.45, 1.62))
    cam = bpy.context.active_object
    cam.name = "Camera_POV_Phong_Khach"
    cam.data.lens = 22
    cam.rotation_euler = (math.radians(82), 0, math.radians(-115))
    scene.camera = cam

    # 10. THIẾT LẬP CHẾ ĐỘ VIEWPORT MẶC ĐỊNH LÀ "MATERIAL PREVIEW" HOẶC "RENDERED DENOISED"
    # Thiết lập Viewport Shading mặc định
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == 'VIEW_3D':
                for space in area.spaces:
                    if space.type == 'VIEW_3D':
                        space.shading.type = 'MATERIAL' # Nét căng ngay lập tức không hạt!
                        space.shading.use_scene_lights = True
                        space.shading.use_scene_world = True

    # 11. LƯU THÀNH FILE MỚI: SOLLINA_Signature_PRO_NetCang.blend
    d_workspace = r"D:\01_Workspace"
    out_file = os.path.join(d_workspace, "SOLLINA_Signature_PRO_NetCang.blend")
    bpy.ops.wm.save_as_mainfile(filepath=out_file)
    print(f"SUCCESS: Saved ultra crisp scene to {out_file}")

if __name__ == "__main__":
    create_super_crisp_scene()
