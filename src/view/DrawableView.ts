import { ItemView, WorkspaceLeaf } from 'obsidian';
import { CSS_PLUGIN_CLASS, ICON_EDIT_MODE_ERASER, ICON_EDIT_MODE_MARKER, ICON_EDIT_MODE_NAV, ICON_EDIT_MODE_PENCIL, ICON_EDIT_MODE_POINTER, ICON_EDIT_MODE_SELECT, ICON_HELP, ICON_MORE_HORIZONTAL, ICON_PLUGIN, ICON_REDO, ICON_SETTING, ICON_UNDO, PLUGIN_DISPLAY_NAME, VIEW_TYPE_DRAWABLE } from '../constants';
import { Control } from 'src/control/Control';
import { ControlGroup } from 'src/control/ControlGroup';
import { SVGBackground } from 'src/svg/SVGBackground';
import { SVGSheet } from 'src/svg/SVGSheet';
import { EInputType, Input } from 'src/input/input';
import { EToolType, Tool } from 'src/tool/tool';
import { DrawablePluginSettings } from 'src/main';

export default class DrawableView extends ItemView {
	controls: Control;
	background: SVGBackground;
	sheet: SVGSheet;
	toolGroup: ControlGroup;
	unredoGroup: ControlGroup;
	settingsGroup: ControlGroup;
	helpGroup: ControlGroup;
	pluginSettings: DrawablePluginSettings;
	input: Input;
	tool: Tool;

	constructor(leaf: WorkspaceLeaf, settings: DrawablePluginSettings) {
		super(leaf);
		this.pluginSettings = settings;
	}

	getViewType(): string {
		return VIEW_TYPE_DRAWABLE;
	}

	getDisplayText(): string {
		return PLUGIN_DISPLAY_NAME;
	}

	async onOpen() {
		// Set Icon of the Window
		this.icon = ICON_PLUGIN;

		this.input = new Input(EInputType.none);
		this.tool = new Tool(EToolType.none);

		const container = this.containerEl.children[1];
		container.addClass(CSS_PLUGIN_CLASS);
		container.empty();
		container.createEl('div', { cls: ['wrapper', CSS_PLUGIN_CLASS] });

		// Background
		this.background = new SVGBackground(container.children[0]);
		// Controls
		this.controls = new Control(container.children[0]);
		// SVG Sheet
		this.sheet = new SVGSheet(container.children[0],
			(ev) => {
				if (this.tool.getType() === EToolType.pencil) {
					this.sheet.addPath(ev.offsetX, ev.offsetY, 2, 'black');
				}
			},
			(ev) => {
				if (this.tool.getType() === EToolType.pencil) {
					this.sheet.appendPath(ev.offsetX, ev.offsetY);
				}
			},
			(ev) => {
				if (this.tool.getType() === EToolType.pencil) {
					this.sheet.appendPath(ev.offsetX, ev.offsetY);
				}
			});

		// Tools Group
		this.toolGroup = this.controls.createControlGroup();
		// Pencil
		const pencilSubGroup = this.toolGroup.createControlSubGroup({});
		const pencil = pencilSubGroup.createControlItem({ id: 'pencil', label: 'Pencil', icon: ICON_EDIT_MODE_PENCIL, selectgroup: this.toolGroup, onClickCallback: () => { this.updateTool(EToolType.pencil); } });
		pencilSubGroup.createControlItem({ id: 'pencil_o', label: 'Pencil Options', icon: ICON_MORE_HORIZONTAL, invisible: true, parantitem: pencil });
		// Marker
		const markerSubGroup = this.toolGroup.createControlSubGroup({});
		const marker = markerSubGroup.createControlItem({ id: 'marker', label: 'Marker', icon: ICON_EDIT_MODE_MARKER, selectgroup: this.toolGroup, onClickCallback: () => { this.updateTool(EToolType.marker); } });
		markerSubGroup.createControlItem({ id: 'marker_o', label: 'Marker Options', icon: ICON_MORE_HORIZONTAL, invisible: true, parantitem: marker });
		// Eraser
		const eraserSubGroup = this.toolGroup.createControlSubGroup({});
		const eraser = eraserSubGroup.createControlItem({ id: 'eraser', label: 'Eraser', icon: ICON_EDIT_MODE_ERASER, selectgroup: this.toolGroup, onClickCallback: () => { this.updateTool(EToolType.eraser); } });
		eraserSubGroup.createControlItem({ id: 'eraser_o', label: 'Eraser Options', icon: ICON_MORE_HORIZONTAL, invisible: true, parantitem: eraser });
		// Select
		const selectSubGroup = this.toolGroup.createControlSubGroup({});
		const select = selectSubGroup.createControlItem({ id: 'select', label: 'Select', icon: ICON_EDIT_MODE_SELECT, selectgroup: this.toolGroup, onClickCallback: () => { this.updateTool(EToolType.select); } });
		selectSubGroup.createControlItem({ id: 'select_o', label: 'Select Options', icon: ICON_MORE_HORIZONTAL, invisible: true, parantitem: select });
		// Pointer
		const pointerSubGroup = this.toolGroup.createControlSubGroup({});
		const pointer = pointerSubGroup.createControlItem({ id: 'pointer', label: 'Pointer', icon: ICON_EDIT_MODE_POINTER, selectgroup: this.toolGroup, onClickCallback: () => { this.updateTool(EToolType.pointer); } });
		pointerSubGroup.createControlItem({ id: 'pointer_o', label: 'Pointer Options', icon: ICON_MORE_HORIZONTAL, invisible: true, parantitem: pointer });
		// Navigate
		this.toolGroup.createControlItem({ id: 'navigate', label: 'Navigate', icon: ICON_EDIT_MODE_NAV, selectgroup: this.toolGroup, onClickCallback: () => { this.updateTool(EToolType.navigate); } });

		// Undo Redo Group
		this.unredoGroup = this.controls.createControlGroup();
		// Undo
		this.unredoGroup.createControlItem({ id: 'undo', label: 'Undo', icon: ICON_UNDO });
		// Redo
		this.unredoGroup.createControlItem({ id: 'redo', label: 'Redo', icon: ICON_REDO });

		// Settings Group
		this.settingsGroup = this.controls.createControlGroup();
		// Settings
		this.settingsGroup.createControlItem({ id: 'settings', label: 'Settings', icon: ICON_SETTING });

		// Help Group
		this.helpGroup = this.controls.createControlGroup();
		// Help
		this.helpGroup.createControlItem({ id: 'help', label: 'Help', icon: ICON_HELP });

		// Mouse, Pen, Touch Input
		this.registerDomEvent(document, 'pointermove', (evt: PointerEvent) => {
			this.updateInput(Input.StringToType(evt.pointerType));
		});
		this.registerDomEvent(document, 'pointerdown', (evt: PointerEvent) => {
			this.updateInput(Input.StringToType(evt.pointerType));
		});

		// Keyboard Input
		this.registerDomEvent(document, 'keydown', () => {
			this.updateInput(Input.StringToType('keyboard'));
		});
	}

	async onClose() {
		// Nothing to clean up.
	}

	updateInput(inputType: EInputType) {
		if (this.input.getType() !== inputType) {
			this.input.setType(inputType);
			if (inputType == EInputType.mouse) {
				this.updateTool(this.pluginSettings.MouseDefaultTool);
			}
			else if (inputType == EInputType.pen) {
				this.updateTool(this.pluginSettings.PenDefaultTool);
			}
			else if (inputType == EInputType.touch) {
				this.updateTool(this.pluginSettings.TouchDefaultTool);
			}
		}
	}

	updateTool(toolType: EToolType) {
		console.log(toolType);
		this.tool.setType(toolType);
		this.toolGroup.changeSelected(toolType.toString().toLocaleLowerCase());
	}
}