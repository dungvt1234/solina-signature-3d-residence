import bpy
import math
import os

def build_and_export():
    print(">>> 1. Creating Clean Scene in Blender...")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene

    base_dir = r"C:\Users\DELL\antigravity\Solina-Signature-B.11.17-—-3D-POV-Residence"
    export_path = os.path.join(base_dir, "public", "models", "apartment.glb")

    # 1. PBR MATERIALS
    def create_pbr(name, color=(1, 1, 1, 1), roughness=0.5, metallic=0.0, clearcoat=0.0, transmission=0.0, ior=1.45):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            if "Base Color" in bsdf.inputs: bsdf.inputs["Base Color"].default_value = color
            if "Roughness" in bsdf.inputs: bsdf.inputs["Roughness"].default_value = roughness
            if "Metallic" in bsdf.inputs: bsdf.inputs["Metallic"].default_value = metallic
            if "Coat Weight" in bsdf.inputs: bsdf.inputs["Coat Weight"].default_value = clearcoat
            elif "Clearcoat" in bsdf.inputs: bsdf.inputs["Clearcoat"].default_value = clearcoat
            if "Transmission Weight" in bsdf.inputs: bsdf.inputs["Transmission Weight"].default_value = transmission
            elif "Transmission" in bsdf.inputs: bsdf.inputs["Transmission"].default_value = transmission
            if "IOR" in bsdf.inputs: bsdf.inputs["IOR"].default_value = ior
        return mat

    mat_plaster = create_pbr("Mat_Plaster_Wall", color=(0.95, 0.94, 0.92, 1.0), roughness=0.85)
    mat_porcelain = create_pbr("Mat_Viglacera_Porcelain", color=(0.98, 0.98, 0.99, 1.0), roughness=0.08, clearcoat=1.0)
    mat_laminate = create_pbr("Mat_Wood_Laminate_Bedroom", color=(0.78, 0.58, 0.40, 1.0), roughness=0.62)
    mat_wood_slats = create_pbr("Mat_Wood_Slats_3D", color=(0.74, 0.52, 0.32, 1.0), roughness=0.48)
    mat_quartz = create_pbr("Mat_Quartz_Countertop", color=(0.94, 0.93, 0.92, 1.0), roughness=0.04, clearcoat=1.0)
    mat_skirting = create_pbr("Mat_Skirting_Board", color=(0.98, 0.97, 0.96, 1.0), roughness=0.25)
    mat_sofa = create_pbr("Mat_Cream_Fabric_Sofa", color=(0.91, 0.88, 0.82, 1.0), roughness=0.92)
    mat_teal = create_pbr("Mat_Teal_Accent", color=(0.20, 0.42, 0.52, 1.0), roughness=0.82)
    mat_linen = create_pbr("Mat_Bed_Linen", color=(0.94, 0.92, 0.88, 1.0), roughness=0.88)
    mat_rug = create_pbr("Mat_Coastal_Rug", color=(0.88, 0.85, 0.78, 1.0), roughness=0.95)
    mat_rattan = create_pbr("Mat_Rattan_Chair", color=(0.68, 0.52, 0.35, 1.0), roughness=0.85)
    mat_brass = create_pbr("Mat_Brass_Gold", color=(0.95, 0.78, 0.42, 1.0), roughness=0.22, metallic=0.95)
    mat_chrome = create_pbr("Mat_Chrome_Grohe", color=(0.95, 0.95, 0.95, 1.0), roughness=0.05, metallic=1.0)
    mat_glass = create_pbr("Mat_Tempered_Glass", color=(0.95, 0.98, 1.0, 0.2), roughness=0.02, transmission=0.88, ior=1.52)
    mat_dark_frame = create_pbr("Mat_Xingfa_Frame", color=(0.15, 0.15, 0.16, 1.0), roughness=0.35, metallic=0.7)
    mat_tv = create_pbr("Mat_OLED_TV", color=(0.02, 0.02, 0.03, 1.0), roughness=0.1, clearcoat=0.9)
    mat_ac = create_pbr("Mat_Daikin_AC", color=(0.96, 0.96, 0.96, 1.0), roughness=0.28)
    mat_pot = create_pbr("Mat_Ceramic_Pot", color=(0.92, 0.90, 0.88, 1.0), roughness=0.3)
    mat_leaf = create_pbr("Mat_Palm_Leaf", color=(0.16, 0.48, 0.22, 1.0), roughness=0.45)

    # Scanned grass turf PBR
    mat_grass = bpy.data.materials.new(name="Mat_Lawn_Turf_PBR")
    mat_grass.use_nodes = True
    gnodes = mat_grass.node_tree.nodes
    glinks = mat_grass.node_tree.links
    gbsdf = gnodes.get("Principled BSDF")
    if gbsdf:
        if "Roughness" in gbsdf.inputs: gbsdf.inputs["Roughness"].default_value = 0.90
        color_path = os.path.join(base_dir, "public", "textures", "grass", "grass_color.jpg")
        nor_path = os.path.join(base_dir, "public", "textures", "grass", "grass_nor.jpg")
        if os.path.exists(color_path):
            img_n = gnodes.new("ShaderNodeTexImage")
            img_n.image = bpy.data.images.load(color_path)
            glinks.new(img_n.outputs["Color"], gbsdf.inputs["Base Color"])
        if os.path.exists(nor_path):
            nor_n = gnodes.new("ShaderNodeTexImage")
            nor_n.image = bpy.data.images.load(nor_path)
            nor_n.image.colorspace_settings.name = 'Non-Color'
            nor_map = gnodes.new("ShaderNodeNormalMap")
            nor_map.inputs["Strength"].default_value = 0.85
            glinks.new(nor_n.outputs["Color"], nor_map.inputs["Color"])
            if "Normal" in gbsdf.inputs:
                glinks.new(nor_map.outputs["Normal"], gbsdf.inputs["Normal"])

    # 2. FLOORS (Living, Balcony Grass, 2 Laminate Bedrooms)
    print(">>> 2. Adding Floors...")
    # Main porcelain floor (Living + Kitchen + Hallway)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.71, 0.0))
    floor_main = bpy.context.active_object
    floor_main.name = "Floor_Living_Porcelain"
    floor_main.scale = (12.24, 5.82, 1)
    floor_main.data.materials.append(mat_porcelain)

    # Master bedroom laminate floor
    bpy.ops.mesh.primitive_plane_add(size=1, location=(-4.27, -0.525, 0.003))
    floor_mbed = bpy.context.active_object
    floor_mbed.name = "Floor_Master_Laminate"
    floor_mbed.scale = (3.70, 3.35, 1)
    floor_mbed.data.materials.append(mat_laminate)

    # Bedroom 2 laminate floor
    bpy.ops.mesh.primitive_plane_add(size=1, location=(-0.635, -0.525, 0.003))
    floor_bed2 = bpy.context.active_object
    floor_bed2.name = "Floor_Bedroom2_Laminate"
    floor_bed2.scale = (3.57, 3.35, 1)
    floor_bed2.data.materials.append(mat_laminate)

    # Balcony lush green grass turf
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -2.98, 0.006))
    floor_balc = bpy.context.active_object
    floor_balc.name = "Floor_Balcony_GrassTurf"
    floor_balc.scale = (12.30, 1.56, 1)
    floor_balc.data.materials.append(mat_grass)

    # 3. ARCHITECTURAL WALLS
    print(">>> 3. Adding Architectural Walls...")
    WALL_HEIGHT = 2.95
    walls = [
        # Outer walls
        {"x1": -6.12, "y1": 3.62, "x2": 4.95, "y2": 3.62, "th": 0.16, "mat": mat_plaster, "name": "Wall_South_1"},
        {"x1": 5.90, "y1": 3.62, "x2": 6.12, "y2": 3.62, "th": 0.16, "mat": mat_plaster, "name": "Wall_South_2"},
        {"x1": 6.12, "y1": -2.20, "x2": 6.12, "y2": 3.62, "th": 0.16, "mat": mat_plaster, "name": "Wall_East"},
        {"x1": -6.12, "y1": -1.50, "x2": -6.12, "y2": 3.62, "th": 0.16, "mat": mat_plaster, "name": "Wall_West"},
        # Master bath
        {"x1": -6.12, "y1": 1.50, "x2": -3.38, "y2": 1.50, "th": 0.14, "mat": mat_plaster, "name": "Wall_MasterBath_North"},
        {"x1": -2.55, "y1": 1.50, "x2": -2.55, "y2": 3.62, "th": 0.14, "mat": mat_plaster, "name": "Wall_MasterBath_East"},
        {"x1": -2.42, "y1": -2.20, "x2": -2.42, "y2": 0.58, "th": 0.18, "mat": mat_plaster, "name": "Wall_Master_East"},
        # Common bath
        {"x1": -2.35, "y1": 1.50, "x2": -1.58, "y2": 1.50, "th": 0.12, "mat": mat_plaster, "name": "Wall_CommonBath_North"},
        {"x1": -0.78, "y1": 1.50, "x2": -0.78, "y2": 3.62, "th": 0.14, "mat": mat_plaster, "name": "Wall_CommonBath_East"},
        # Bedroom 2
        {"x1": -2.22, "y1": -2.20, "x2": -2.22, "y2": 1.15, "th": 0.14, "mat": mat_plaster, "name": "Wall_Bed2_West"},
        {"x1": -2.22, "y1": 1.15, "x2": 0.42, "y2": 1.15, "th": 0.14, "mat": mat_plaster, "name": "Wall_Bed2_North"},
        {"x1": 1.38, "y1": -2.20, "x2": 1.38, "y2": 1.15, "th": 0.18, "mat": mat_plaster, "name": "Wall_Bed2_East"},
        # Balcony Glass Balustrade & Glazing
        {"x1": -2.95, "y1": -2.20, "x2": -2.42, "y2": -2.20, "th": 0.05, "mat": mat_glass, "name": "Glazing_Master"},
        {"x1": -2.22, "y1": -2.20, "x2": -0.95, "y2": -2.20, "th": 0.05, "mat": mat_glass, "name": "Glazing_Bed2_L"},
        {"x1": 0.85, "y1": -2.20, "x2": 1.38, "y2": -2.20, "th": 0.05, "mat": mat_glass, "name": "Glazing_Bed2_R"},
        {"x1": 1.38, "y1": -2.20, "x2": 2.15, "y2": -2.20, "th": 0.05, "mat": mat_glass, "name": "Glazing_Living_L"},
        {"x1": 4.95, "y1": -2.20, "x2": 6.12, "y2": -2.20, "th": 0.05, "mat": mat_glass, "name": "Glazing_Living_R"},
        {"x1": 6.15, "y1": -3.76, "x2": 6.15, "y2": -2.20, "th": 0.03, "mat": mat_glass, "name": "Railing_East"},
        {"x1": -4.05, "y1": -3.76, "x2": 6.15, "y2": -3.76, "th": 0.03, "mat": mat_glass, "name": "Railing_North"},
    ]

    for w in walls:
        dx = w["x2"] - w["x1"]
        dy = w["y2"] - w["y1"]
        length = math.hypot(dx, dy)
        angle = math.atan2(dy, dx)
        mx = (w["x1"] + w["x2"]) / 2
        my = (w["y1"] + w["y2"]) / 2
        h = 1.15 if "Railing" in w["name"] else WALL_HEIGHT

        bpy.ops.mesh.primitive_cube_add(size=1)
        wall_obj = bpy.context.active_object
        wall_obj.name = w["name"]
        wall_obj.scale = (length, w["th"], h)
        wall_obj.location = (mx, my, h / 2)
        wall_obj.rotation_euler = (0, 0, angle)
        wall_obj.data.materials.append(w["mat"])

    # 4. SKIRTING BOARDS (Len chân tường trắng sứ)
    print(">>> 4. Adding Skirting Boards...")
    def add_skirting(x1, y1, x2, y2, name):
        dx = x2 - x1
        dy = y2 - y1
        length = math.hypot(dx, dy)
        angle = math.atan2(dy, dx)
        bpy.ops.mesh.primitive_cube_add(size=1)
        obj = bpy.context.active_object
        obj.name = name
        obj.scale = (length, 0.012, 0.08)
        obj.location = ((x1 + x2) / 2, (y1 + y2) / 2, 0.04)
        obj.rotation_euler = (0, 0, angle)
        obj.data.materials.append(mat_skirting)

    add_skirting(-6.12, 3.60, 4.95, 3.60, "Skirting_South")
    add_skirting(6.10, -2.18, 6.10, 3.60, "Skirting_East")
    add_skirting(-2.40, -2.18, -2.40, 1.15, "Skirting_MBed_East")
    add_skirting(1.36, -2.18, 1.36, 1.15, "Skirting_Bed2_East")

    # 5. 98 FLUTED WOOD SLATS (TV Feature Wall)
    print(">>> 5. Adding 98 Slats TV Wall...")
    slat_count = 98
    wall_len = 5.10
    start_y = 1.05 - wall_len / 2 + 0.026
    for i in range(slat_count):
        y = start_y + (i / (slat_count - 1)) * (wall_len - 0.052)
        bpy.ops.mesh.primitive_cube_add(size=1)
        slat = bpy.context.active_object
        slat.name = f"WoodSlat_{i+1:02d}"
        slat.scale = (0.032, 0.034, 2.70)
        slat.location = (5.98, y, 1.38)
        slat.data.materials.append(mat_wood_slats)

    # 6. HIGH-END FURNITURE & FIXTURES
    print(">>> 6. Adding Furniture & Fixtures...")
    # Living Room - Curved Sectional Sofa
    bpy.ops.mesh.primitive_cube_add(size=1, location=(3.80, -0.45, 0.22))
    sofa_base = bpy.context.active_object
    sofa_base.name = "Sofa_Base"
    sofa_base.scale = (2.60, 1.05, 0.44)
    sofa_base.data.materials.append(mat_sofa)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(3.80, -0.05, 0.55))
    sofa_back = bpy.context.active_object
    sofa_back.name = "Sofa_Backrest"
    sofa_back.scale = (2.60, 0.32, 0.65)
    sofa_back.data.materials.append(mat_sofa)

    # Teal Cushions
    bpy.ops.mesh.primitive_cube_add(size=1, location=(2.85, -0.22, 0.52))
    pillow1 = bpy.context.active_object
    pillow1.name = "Sofa_Pillow_1"
    pillow1.scale = (0.42, 0.22, 0.42)
    pillow1.rotation_euler = (0.2, 0.1, 0.3)
    pillow1.data.materials.append(mat_teal)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(4.75, -0.22, 0.52))
    pillow2 = bpy.context.active_object
    pillow2.name = "Sofa_Pillow_2"
    pillow2.scale = (0.42, 0.22, 0.42)
    pillow2.rotation_euler = (0.2, -0.1, -0.3)
    pillow2.data.materials.append(mat_teal)

    # Coffee Table (Round Marble + Brass Rim)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.48, depth=0.36, location=(3.80, -1.05, 0.18))
    table = bpy.context.active_object
    table.name = "Table_Coffee_Round"
    table.data.materials.append(mat_quartz)

    # Coastal Rug
    bpy.ops.mesh.primitive_cube_add(size=1, location=(3.80, -0.65, 0.01))
    rug = bpy.context.active_object
    rug.name = "Living_Rug"
    rug.scale = (3.40, 2.60, 0.015)
    rug.data.materials.append(mat_rug)

    # 75" Wall TV & Console
    bpy.ops.mesh.primitive_cube_add(size=1, location=(5.88, 0.55, 1.45))
    tv = bpy.context.active_object
    tv.name = "TV_75Inch_OLED"
    tv.scale = (0.05, 1.68, 0.96)
    tv.data.materials.append(mat_tv)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(5.78, 0.55, 0.42))
    console = bpy.context.active_object
    console.name = "TV_Floating_Console"
    console.scale = (0.35, 2.40, 0.32)
    console.data.materials.append(mat_wood_slats)

    # Kitchen & Island (Laminate base + Quartz Countertop)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.98, 3.22, 0.45))
    k_base = bpy.context.active_object
    k_base.name = "Kitchen_Cabinets"
    k_base.scale = (4.45, 0.65, 0.88)
    k_base.data.materials.append(mat_wood_slats)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.98, 3.22, 0.91))
    k_top = bpy.context.active_object
    k_top.name = "Kitchen_Quartz_Countertop"
    k_top.scale = (4.55, 0.72, 0.04)
    k_top.data.materials.append(mat_quartz)

    # Kitchen Island
    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.98, 2.28, 0.45))
    island = bpy.context.active_object
    island.name = "Island_Cabinets"
    island.scale = (1.60, 0.90, 0.88)
    island.data.materials.append(mat_wood_slats)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.98, 2.28, 0.91))
    island_top = bpy.context.active_object
    island_top.name = "Island_Quartz_Top"
    island_top.scale = (1.70, 0.98, 0.04)
    island_top.data.materials.append(mat_quartz)

    # Dining Table & Chairs
    bpy.ops.mesh.primitive_cube_add(size=1, location=(3.65, 1.85, 0.74))
    dining = bpy.context.active_object
    dining.name = "Dining_Table"
    dining.scale = (1.80, 0.92, 0.05)
    dining.data.materials.append(mat_wood_slats)

    # Master King Bed with Slats Headboard
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-4.35, -0.45, 0.28))
    m_bed = bpy.context.active_object
    m_bed.name = "Bed_Master_King"
    m_bed.scale = (2.05, 2.15, 0.55)
    m_bed.data.materials.append(mat_linen)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(-4.35, 0.68, 0.75))
    m_headboard = bpy.context.active_object
    m_headboard.name = "Headboard_Master_Slats"
    m_headboard.scale = (2.85, 0.12, 1.40)
    m_headboard.data.materials.append(mat_wood_slats)

    # Bedroom 2 Bed
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.65, -0.45, 0.26))
    bed2 = bpy.context.active_object
    bed2.name = "Bed_Bedroom2_Queen"
    bed2.scale = (1.75, 2.05, 0.52)
    bed2.data.materials.append(mat_linen)

    # Daikin AC Linear Diffuser Units
    def add_ac(x, y, name):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, 2.90))
        ac = bpy.context.active_object
        ac.name = name
        ac.scale = (0.88, 0.28, 0.06)
        ac.data.materials.append(mat_ac)

    add_ac(3.85, -0.80, "AC_Daikin_Living_1")
    add_ac(5.20, -0.80, "AC_Daikin_Living_2")

    # Balcony Rattan Lounge Chairs
    bpy.ops.mesh.primitive_cylinder_add(radius=0.42, depth=0.72, location=(-0.55, -3.05, 0.36))
    rattan1 = bpy.context.active_object
    rattan1.name = "Rattan_Chair_1"
    rattan1.data.materials.append(mat_rattan)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.42, depth=0.72, location=(0.65, -3.05, 0.36))
    rattan2 = bpy.context.active_object
    rattan2.name = "Rattan_Chair_2"
    rattan2.data.materials.append(mat_rattan)

    # Tropical Resort Plants in Balcony & Living Room
    def add_palm(x, y, z=0.0):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.18, depth=0.45, location=(x, y, z + 0.22))
        pot = bpy.context.active_object
        pot.name = "Pot"
        pot.data.materials.append(mat_pot)

        bpy.ops.mesh.primitive_cone_add(radius1=0.45, depth=0.95, location=(x, y, z + 0.75))
        foliage = bpy.context.active_object
        foliage.name = "Palm_Foliage"
        foliage.data.materials.append(mat_leaf)

    add_palm(-5.05, -2.95)
    add_palm(1.85, -3.35)
    add_palm(5.55, -3.15)
    add_palm(2.05, 0.72)

    # 7. EXPORT TO GLB
    print(f">>> 7. Exporting to {export_path}...")
    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_yup=True
    )
    print(">>> GLB EXPORT COMPLETED SUCCESSFULLY!")

build_and_export()
