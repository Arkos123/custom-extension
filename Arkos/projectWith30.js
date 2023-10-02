import Cast from '../utils/cast.js'
import Color from '../utils/color.js'

// import cover from './assets/icon.svg'
// import icon from './assets/icon.svg'
//鸣谢：-6 优化代码和修复了一些 bug；_30 提供了部分拓展积木
const extensionId = 'arkosExtensions';

/** @typedef {string|number|boolean} SCarg 来自Scratch圆形框的参数，虽然这个框可能只能输入数字，但是可以放入变量，因此有可能获得数字和文本，需要同时处理 */

/** @typedef {any} Util util 参数，暂时定为 any */

/**
 * @typedef {{name: SCarg, rankValue: number, extra: SCarg}} SortedTableItem 排序表项目
 * @typedef {{order: "asc"|"desc", list: SortedTableItem[]}} SortedTable 排序表
 */

class ArkosExtensions {
	constructor(runtime) {
		this.runtime = runtime

		/** 临时数据
		 * @type {{[name: string]: SCarg | SCarg[] | {[key: string]: SCarg}}}
		 */
		this.tempData = {}

		/**
		 * 记录上一帧按下的键状态
		 * @type {{[key: string]: boolean}}
		 */
		this.lastKeyPressed={} //记录上一帧按下的键状态

		/**
		 * 排序表
		 * @type {{[name: string]: SortedTable}}
		 */
		this.sortedTable = {
			list1: {
				order: 'desc',
				list: []
			},
			list2: {
				order: 'desc',
				list: []
			},
		}

		this._formatMessage = runtime.getFormatMessage({
			'zh-cn': {
				'ArkosExt.extensionName': 'Arkosの拓展',
				'ArkosExt.info1': '🚶 坐标和方向',
				'ArkosExt.info2': '🔠 字符串处理',
				'ArkosExt.info3': '🛠 实用积木',
				'ArkosExt.info3.5': '⚙️ JSON工具',
				'ArkosExt.info4': '📄 信息获取',
				'ArkosExt.info5': '📊 排序表',
				'ArkosExt.info6': '🗂️ 临时数据',
				'ArkosExt.info7': '临时变量',
				'ArkosExt.info8': '临时列表',
				'ArkosExt.info9': '临时容器',
				'ArkosExt.stringEquality': '(区分大小写)[ONE]=[TWO]',
				'ArkosExt.directionFromAtoB': '点x1:[X1]y1:[Y1]朝向点x2:[X2]y2:[Y2]的方向',
				'ArkosExt.differenceBetweenDirections': '由方向1[a]到方向2[b]的角度差',
				'ArkosExt.distance': '点x1:[X1]y1:[Y1]到点x2:[X2]y2:[Y2]的距离',
				'ArkosExt.searchString': '在[str]中查找[substr]的位置(从位置[pos]开始找)',
				'ArkosExt.insertString': '在[str]的第[pos]个字符前插入[substr]',
				'ArkosExt.replaceString': '将[str]中的第[start]个到第[end]个字符,替换为[substr]',
				'ArkosExt.turnDegreesToDir': '朝方向[dir]旋转[degree]度',

				'ArkosExt.getEffect': '获取特效[EFFECT]的值',
				'ArkosExt.color': '颜色',
				'ArkosExt.fisheye': '鱼眼',
				'ArkosExt.whirl': '旋涡',
				'ArkosExt.pixelate': '像素化',
				'ArkosExt.mosaic': '马赛克',
				'ArkosExt.brightness': '亮度',
				'ArkosExt.ghost': '虚像',

				'ArkosExt.isHiding': '角色隐藏？',
				'ArkosExt.getRotationStyle': '当前旋转方式',
				'ArkosExt.getWidthOrHeight': '获取当前造型的[t]',
				'ArkosExt.setSize': '强行将大小设为[size]（无视限制）',
				'ArkosExt.width': '宽',
				'ArkosExt.height': '高',
				'ArkosExt.true': '成立',
				'ArkosExt.false': '不成立',
				'ArkosExt.probability': '概率[p]',
				'ArkosExt.getKeyDown': '按下[key],且上次检测未按下',
				'ArkosExt.dataChanged': '当值[c]发生变化',
				'ArkosExt.isNum': '是数字',
				'ArkosExt.isInt': '是整数',
				'ArkosExt.sgn': '[c]的符号',
				'ArkosExt.defaultValue': '[c],默认值=[d]',
				'ArkosExt.reporterToBoolean': '[t][type]',
				'ArkosExt.max': '最大值',
				'ArkosExt.min': '最小值',
				'ArkosExt.diff': '差',
				'ArkosExt.sumOfSqu': '平方和',
				'ArkosExt.sqrtSumOfSqu': '平方和开根号',
				'ArkosExt.contain': '[list]包含[c]?(以[ch]分隔)',
				'ArkosExt.lenOfJSONList': '列表JSON[list]的长度',
				'ArkosExt.JSONListContains': '列表JSON[list]包含[c]?',
				'ArkosExt.editJSONList': '列表JSON[list]将[c][type]',
				'ArkosExt.JSONm1': '加到末尾',
				'ArkosExt.JSONm2': '从中删除',

				'ArkosExt.setXY': '强行移到x:[x]y:[y]（无视边界）',
				'ArkosExt.getBoundaryCoord': '获取角色的[t]',
				'ArkosExt.top': '上边缘y',
				'ArkosExt.bottom': '下边缘y',
				'ArkosExt.left': '左边缘x',
				'ArkosExt.right': '右边缘x',
				'ArkosExt.isOutOfSight': '角色移到舞台区外？',
				'ArkosExt.cloneCount': '当前克隆体数量',

				'ArkosExt.and': '且',
				'ArkosExt.or': '或',

				'ArkosExt.clearSortedTable': '📊清空排序表[list]',
				'ArkosExt.setTypeOfSortedTable': '📊将排序表[list]的排序方式设为[type]',
				'ArkosExt.addToSortedTable': '📊将内容(重名的则覆盖)[name],排序值[value]加入排序表[list],附加信息[extra]',
				'ArkosExt.getFromSortedTableByNo': '📊获取排序表[list]中第[n]项的[t]',
				'ArkosExt.getFromSortedTableByName': '📊获取[name]在排序表[list]中的[t]',
				'ArkosExt.lengthOfSortedTable': '📊排序表[list]中内容数',
				'ArkosExt.deleteNameOfSortedTable': '📊删除排序表[list]中名为[name]的项',
				'ArkosExt.asc': '升序',
				'ArkosExt.desc': '降序',

				'ArkosExt.name': '名称',
				'ArkosExt.rank': '表中位置',
				'ArkosExt.rankValue': '排序值',
				'ArkosExt.extra': '附加信息',

				'ArkosExt.colorToHex': '颜色[COLOR]的代码',

				'ArkosExt.deleteAllTempData': '🗂️清空所有临时数据',
				'ArkosExt.getCountOfTempData': '🗂️临时数据量',
				'ArkosExt.delTempData': '🗂️删除名为[data]的临时数据',
				'ArkosExt.ifTempDataExist': '🗂️存在名为[data]的临时数据？',

				'ArkosExt.setTempVar': '🗂️将临时变量[var]设为[t]',
				'ArkosExt.addTempVar': '🗂️将临时变量[var]增加[t]',
				'ArkosExt.getTempVar': '🗂️临时数据[var]',

				'ArkosExt.clearTempList': '🗂️创建或清空临时列表[list]',
				'ArkosExt.initTempList': '🗂️临时列表[list]内容设为[t]',
				'ArkosExt.addTempList': '🗂️向临时列表[list]加入[t]',
				'ArkosExt.opTempList': '🗂️将临时列表[list]第[n]项[op][t]',
				'ArkosExt.ListOp1': '前插入',
				'ArkosExt.ListOp2': '替换为',
				'ArkosExt.ListOp3': '增加',
				'ArkosExt.delItemOfTempList': '🗂️删除临时列表[list]第[n]项',
				'ArkosExt.getItemOfTempList': '🗂️临时列表[list]第[n]项',
				'ArkosExt.lengthOfTempList': '🗂️临时列表[list]长度',
				'ArkosExt.ifListItemExist': '🗂️临时列表[list]包含[c]？',
				'ArkosExt.getListItemIdx': '🗂️临时列表[list]中第一个[c]的编号',

				'ArkosExt.clearTempCon': '🗂️创建或清空临时容器[con]',
				'ArkosExt.initTempCon': '🗂️临时容器[con]内容设为[t]',
				'ArkosExt.opTempCon': '🗂️临时容器[con]中的[c][op][t]',
				'ArkosExt.conOp1': '设为',
				'ArkosExt.conOp2': '增加',
				'ArkosExt.delItemOfTempCon': '🗂️删除临时容器[con]中名为[c]的内容',
				'ArkosExt.getItemOfTempConByName': '🗂️临时容器[con]中的[c]',
				'ArkosExt.getItemOfTempConByNo': '🗂️临时容器[con]第[n]项的[t]',
				'ArkosExt.conInfo1': '名称',
				'ArkosExt.conInfo2': '内容',
				'ArkosExt.lengthOfTempCon': '🗂️临时容器[con]中内容数',
				'ArkosExt.ifConItemExist': '🗂️临时容器[con]包含[c]？',

				'30Ext.info': '✨ 以下扩展由_30提供',
				'30Ext.info.1': '🔮 定向缩放操作',
				'30Ext.block.mirrorSprite': '(❌废弃，请使用新积木)[mirrorMethod]当前角色',
				'30Ext.block.clearMirror': '(❌废弃，请使用新积木)清除角色镜像变换',
				'30Ext.block.scaleSpriteX': '将角色水平缩放比例设为[input](倍)',
				'30Ext.block.scaleSpriteY': '将角色垂直缩放比例设为[input](倍)',
				'30Ext.info.2': '图层操作',
				'30Ext.block.getLayer': '角色当前图层序数',
				'30Ext.block.setLayer': '将角色移到第[input]图层',
				'30Ext.block.getScale': '当前角色的[input]缩放(倍)',
				'30Ext.block.hor': '水平',
				'30Ext.block.ver': '垂直',
			},

			en: {
				'ArkosExt.extensionName': 'Arkos\' Extensions',
				'ArkosExt.stringEquality': '(case sensitive)[ONE]=[TWO]',
				'ArkosExt.directionFromAtoB': 'direction from x1:[X1]y1:[Y1]to x2:[X2]y2:[Y2]',
				'ArkosExt.differenceBetweenDirections': 'direction[b] minus direction[a]',
				'ArkosExt.distance': 'distance between x1:[X1]y1:[Y1]and x2:[X2]y2:[Y2]',
				'ArkosExt.searchString': 'position of[substr]in[str],start from[pos]',
				'ArkosExt.insertString': 'insert[substr]at[pos]of[str]',
				'ArkosExt.replaceString': 'replace from[start]to[end]of[str],with[substr]',
				'ArkosExt.turnDegreesToDir': 'turn[degree] degrees toward direction[dir]',
				'ArkosExt.getEffect': 'effect[EFFECT]',
				'ArkosExt.color': 'color',
				'ArkosExt.fisheye': 'fisheye',
				'ArkosExt.whirl': 'whirl',
				'ArkosExt.pixelate': 'pixelate',
				'ArkosExt.mosaic': 'mosaic',
				'ArkosExt.brightness': 'brightness',
				'ArkosExt.ghost': 'ghost',
				'ArkosExt.isHiding': 'is hiding?',
				'ArkosExt.getRotationStyle': 'rotation style',
				'ArkosExt.getWidthOrHeight': 'get [t] of the current costume',
				'ArkosExt.setSize': 'force the size to [size] % (regardless of limitation) ',
				'ArkosExt.width': 'width',
				'ArkosExt.height': 'height',
				'ArkosExt.defaultValue': '[c],default=[d]',
				'ArkosExt.max': 'max',
				'ArkosExt.min': 'min',
				'ArkosExt.diff': 'difference between',
				'ArkosExt.sumOfSqu': 'square sum',
				'ArkosExt.sqrtSumOfSqu': 'sqrt square sum',
				'ArkosExt.contain': '[list]contains[c](separated by[ch])',
				'ArkosExt.lenOfJSONList': 'length of JSON[list]',
				'ArkosExt.JSONListContains': 'list JSON[list]contains key[c]?',
				'ArkosExt.editJSONList': '[c][type]list JSON[list]',
				'ArkosExt.JSONm1': 'add to',
				'ArkosExt.JSONm2': 'delete from',
				'ArkosExt.true': 'is',
				'ArkosExt.false': 'not',
				'ArkosExt.reporterToBoolean': '[type][t]',
				'ArkosExt.probability': 'probability[p]',
				'ArkosExt.getKeyDown': 'key[key]pressed, and not pressed last time',
				'ArkosExt.dataChanged': 'value[c]changed',
				'ArkosExt.isNum': 'is a number',
				'ArkosExt.isInt': 'is an integer',
				'ArkosExt.sgn': 'sign of[c]',

				'ArkosExt.setXY': 'force to x:[x]y:[y] (regardless of the boundary)',
				'ArkosExt.getBoundaryCoord': 'get [t] of the sprite',
				'ArkosExt.top': 'top y',
				'ArkosExt.bottom': 'bottom y',
				'ArkosExt.left': 'left x',
				'ArkosExt.right': 'right x',
				'ArkosExt.isOutOfSight': 'is out of stage?',
				'ArkosExt.cloneCount': 'the number of clones',

				'ArkosExt.and': 'and',
				'ArkosExt.or': 'or',

				'ArkosExt.clearSortedTable': '📊empty sorted table[list]',
				'ArkosExt.setTypeOfSortedTable': '📊set sort order of[list]to[type]',
				'ArkosExt.addToSortedTable': '📊add (overwrite if existed)[name]to table[list] with sort index value[value],extra data[extra] and sort',
				'ArkosExt.getFromSortedTableByNo': '📊get[t]of #[n] from [list]',
				'ArkosExt.getFromSortedTableByName': '📊get[t]of [name] from [list]',
				'ArkosExt.lengthOfSortedTable': '📊length of sorted table[list]',
				'ArkosExt.deleteNameOfSortedTable': '📊delete [name] in[list]',
				'ArkosExt.asc': 'ascending order',
				'ArkosExt.desc': 'descending order',

				'ArkosExt.name': 'name',
				'ArkosExt.rank': 'rank',
				'ArkosExt.rankValue': 'rankValue',
				'ArkosExt.extra': 'extra',

				'ArkosExt.colorToHex': 'get code of color[COLOR]',

				'ArkosExt.info1': '🚶 Coordinate and Direction',
				'ArkosExt.info2': '🔠 String Processing',
				'ArkosExt.info3': '🛠 Utilities',
				'ArkosExt.info3.5': '⚙️ JSON utils',
				'ArkosExt.info4': '📄 Information',
				'ArkosExt.info5': '📊 Sorted Table',
				'ArkosExt.info6': '🗂️ Temporary Data',
				'ArkosExt.info7': 'temp var',
				'ArkosExt.info8': 'temp list',
				'ArkosExt.info9': 'temp container',

				'ArkosExt.deleteAllTempData': '🗂️clear all temporary data',
				'ArkosExt.getCountOfTempData': '🗂️count of temporary data',
				'ArkosExt.delTempData': '🗂️delete temporary data[data]',
				'ArkosExt.ifTempDataExist': '🗂️temporary data[data]exists',

				'ArkosExt.setTempVar': '🗂️set temp var[var] to [t]',
				'ArkosExt.addTempVar': '🗂️change temp var[var] by [t]',
				'ArkosExt.getTempVar': '🗂️temp data[var]',


				'ArkosExt.clearTempList': '🗂️create or clear temp list[list]',
				'ArkosExt.initTempList': '🗂️set temp list[list]to[t]',
				'ArkosExt.addTempList': '🗂️add[t] to temp list[list]',
				'ArkosExt.opTempList': '🗂️[op][t]at [n] of temp list[list]',
				'ArkosExt.ListOp1': 'insert',
				'ArkosExt.ListOp2': 'replace with',
				'ArkosExt.ListOp3': 'change by',
				'ArkosExt.delItemOfTempList': '🗂️delete [n]of temp list[list]',
				'ArkosExt.getItemOfTempList': '🗂️item[n]of temp list[list]',
				'ArkosExt.lengthOfTempList': '🗂️length of temp list[list]',
				'ArkosExt.ifListItemExist': '🗂️temp list[list]contains[c]?',
				'ArkosExt.getListItemIdx': '🗂️item # of[c]in temp list[list]',

				'ArkosExt.clearTempCon': '🗂️create or clear temp container[con]',
				'ArkosExt.initTempCon': '🗂️set temp container[con]to[t]',
				'ArkosExt.opTempCon': '🗂️[c]in temp container[con][op][t]',
				'ArkosExt.conOp1': 'set to',
				'ArkosExt.conOp2': 'change by',
				'ArkosExt.delItemOfTempCon': '🗂️delete[c]in temp container[con]',
				'ArkosExt.getItemOfTempConByName': '🗂️[c]in temp container[con]',
				'ArkosExt.getItemOfTempConByNo': '🗂️[t] of #[n] in temp container[con]',
				'ArkosExt.conInfo1': 'name',
				'ArkosExt.conInfo2': 'content',
				'ArkosExt.lengthOfTempCon': '🗂️count of contents in temp container[con]',
				'ArkosExt.ifConItemExist': '🗂️temp container[con]contains[c]?',

				'30Ext.info': '✨ Contributed by _30',
				'30Ext.info.1': '🔮 Directional scale',
				'30Ext.block.mirrorSprite': '(❌abandoned, use new block instead)[mirrorMethod] current sprite',
				'30Ext.block.clearMirror': '(❌abandoned, use new block instead)Clear the mirror transform',
				'30Ext.block.scaleSpriteX': 'Set the horizontal scaling of the sprite to [input] (Times)',
				'30Ext.block.scaleSpriteY': 'Set the vertical scaling of the sprite to [input] (Times)',
				'30Ext.info.2': 'Layer Manage',
				'30Ext.block.getLayer': 'Current layer of the sprite',
				'30Ext.block.setLayer': 'Move the sprite to layer [input]',
				'30Ext.block.getScale': '[input]scaling of the sprite (Times)',
				'30Ext.block.hor': 'horizontal',
				'30Ext.block.ver': 'vertical',
			},
		})
	}

	/**
	 * 获取翻译
	 * @param {string} id
	 * @returns {string}
	 */
	formatMessage(id) {
		return this._formatMessage({
			id,
			default: id,
			description: id,
		})
	}

	getInfo() {
		return {
			id: extensionId, // 拓展id
			name: this.formatMessage('ArkosExt.extensionName'),

			color1: '#FF8383',
			// menuIconURI: icon,
			// blockIconURI: icon,
			blocks: [
				'---' + this.formatMessage('ArkosExt.info1'), //🏃 坐标&角度
				// 计算点A到点B的方向
				{
					opcode: 'getDirFromAToB',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.directionFromAtoB'),
					arguments: {
						X1: {
							type: 'number',
							defaultValue: 0,
						},
						Y1: {
							type: 'number',
							defaultValue: 0,
						},
						X2: {
							type: 'number',
							defaultValue: 0,
						},
						Y2: {
							type: 'number',
							defaultValue: 0,
						},
					},
				},
				// 计算角b-角a的角度差
				{
					opcode: 'differenceBetweenDirections',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.differenceBetweenDirections'),
					arguments: {
						a: {
							type: 'number',
							defaultValue: 0,
						},
						b: {
							type: 'number',
							defaultValue: 0,
						},
					},
				},
				// 两点距离
				{
					opcode: 'disFromAToB',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.distance'),
					arguments: {
						X1: {
							type: 'number',
							defaultValue: 0,
						},
						Y1: {
							type: 'number',
							defaultValue: 0,
						},
						X2: {
							type: 'number',
							defaultValue: 0,
						},
						Y2: {
							type: 'number',
							defaultValue: 0,
						},
					},
				},
				//朝..方向旋转..角度
				{
					opcode: 'turnDegreesToDir',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.turnDegreesToDir'),
					arguments: {
						degree: {
							type: 'number',
							defaultValue: 45,
						},
						dir: {
							type: 'angle',
							defaultValue: 10,
						},
					},
					filter: ['sprite']
				},
				'---' + this.formatMessage('ArkosExt.info2'), //🔠字符串处理
				// 查找子字符串，从pos开始
				{
					opcode: 'indexof',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.searchString'),
					arguments: {
						str: {
							type: 'string',
							defaultValue: 'banana',
						},
						substr: {
							type: 'string',
							defaultValue: 'na',
						},
						pos: {
							type: 'number',
							defaultValue: 1,
						},
					},
				},
				// 在字符串中插入子字符串
				{
					opcode: 'insertStr',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.insertString'),
					arguments: {
						str: {
							type: 'string',
							defaultValue: 'ac',
						},
						substr: {
							type: 'string',
							defaultValue: 'b',
						},
						pos: {
							type: 'number',
							defaultValue: 2,
						},
					},
				},
				// 替换字符串中的从..到..的字符串
				{
					opcode: 'replaceStr',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.replaceString'),
					arguments: {
						str: {
							type: 'string',
							defaultValue: 'ABCDEF',
						},
						substr: {
							type: 'string',
							defaultValue: 'XX',
						},
						start: {
							type: 'number',
							defaultValue: 3,
						},
						end: {
							type: 'number',
							defaultValue: 4,
						},
					},
				},
				'---' + this.formatMessage('ArkosExt.info3'), //🔧实用积木
				// 判断相等（区分大小写）
				{
					opcode: 'strictlyEquals',
					blockType: 'Boolean',
					text: this.formatMessage('ArkosExt.stringEquality'),
					arguments: {
						ONE: {
							type: 'string',
							defaultValue: 'A',
						},
						TWO: {
							type: 'string',
							defaultValue: 'a',
						},
					},
				},
				//（隐藏）返回值转bool积木
				{
					opcode: 'reporterToBoolean',
					blockType: 'Boolean',
					text: '[t]',
					hideFromPalette: true,
					arguments: {
						t: {
							type: 'string',
							defaultValue: '1',
						}
					},
				},
				//返回值转bool积木2
				{
					opcode: 'reporterToBoolean2',
					blockType: 'Boolean',
					text: this.formatMessage('ArkosExt.reporterToBoolean'),
					arguments: {
						t: {
							type: 'string',
							defaultValue: '1',
						},
						type: {
							type: 'string',
							menu: 'TorF2',
						}
					},
				},
				//概率
				{
					opcode: 'probability',
					blockType: 'Boolean',
					text: this.formatMessage('ArkosExt.probability'),
					arguments: {
						p: {
							type: 'number',
							defaultValue: '0.5',
						}
					},
				},
				//（有bug暂时隐藏）按下x键且上次没按
				// {
				// 	opcode: 'getKeyDown',
				// 	blockType: 'Boolean',
				// 	text: this.formatMessage('ArkosExt.getKeyDown'),
				// 	arguments: {
				// 		key: {
				// 			type: 'string',
				// 			defaultValue: 'a',
				// 		}
				// 	},
				// },
				//（暂时不知如何实现）检测值变化
				// {
				// 	opcode: 'dataChanged',
				// 	blockType: 'Boolean',
				// 	text: this.formatMessage('ArkosExt.dataChanged'),
				// 	arguments: {
				// 		c: {
				// 			type: 'string',
				// 			defaultValue: '变量',
				// 		}
				// 	},
				// },
				//判断是否是数字
				{
					opcode: 'isNum',
					blockType: 'Boolean',
					text: '[type][c]',
					arguments: {
						c: {
							type: 'number',
							defaultValue: '0.2',
						},
						type: {
							type: 'string',
							menu: 'isNumMenu',
						},
					},
				},
				//符号
				{
					opcode: 'sgn',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.sgn'),
					arguments: {
						c: {
							type: 'number',
							defaultValue: '-5',
						}
					},
				},
				//默认值
				{
					opcode: 'defaultValue',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.defaultValue'),
					arguments: {
						c: {
							type: 'string',
							defaultValue: '',
						},
						d: {
							type: 'string',
							defaultValue: '10',
						}
					},
				},
				//max min 差..
				{
					opcode: 'binaryCal',
					blockType: 'reporter',
					text: '[cal][a][b]',
					arguments: {
						cal: {
							type: 'string',
							menu: 'biCalMenu',
						},
						a: {
							type: 'string',
							defaultValue: '1',
						},
						b: {
							type: 'string',
							defaultValue: '99',
						}
					},
				},
				//xx,xx,xx包含xx？
				{
					opcode: 'contain',
					blockType: 'Boolean',
					text: this.formatMessage('ArkosExt.contain'),
					arguments: {
						list: {
							type: 'string',
							defaultValue: '苹果,香蕉,橘子,菠萝',
						},
						ch: {
							type: 'string',
							defaultValue: ',',
						},
						c: {
							type: 'string',
							defaultValue: '苹果',
						}
					},
				},
				//形如 a≤b≤c
				{
					opcode: 'compareTwoSides',
					blockType: 'Boolean',
					text: '[a][op1][b][op2][c]',
					arguments: {
						a: {
							type: 'string',
							defaultValue: '1',
						},
						b: {
							type: 'string',
							defaultValue: 'x',
						},
						c: {
							type: 'string',
							defaultValue: '3',
						},
						op1: {
							type: 'string',
							menu: 'opMenu1',
						},
						op2: {
							type: 'string',
							menu: 'opMenu1',
						},
					},
				},
				//形如：a≤b且/或>c op1,op2 logic  compareTwoSidesPlus
				{
					opcode: 'compareTwoSidesPlus',
					blockType: 'Boolean',
					text: '[a][op1][b][logic][op2][c]',
					arguments: {
						a: {
							type: 'string',
							defaultValue: 'x',
						},
						b: {
							type: 'string',
							defaultValue: '1',
						},
						c: {
							type: 'string',
							defaultValue: '3',
						},
						op1: {
							type: 'string',
							menu: 'opMenu2',
							defaultValue: '<',
						},
						op2: {
							type: 'string',
							menu: 'opMenu2',
							defaultValue: '>',
						},
						logic: {
							type: 'string',
							menu: 'logicMenu',
							defaultValue: 'or', //
						},
					},
				},
				//获取颜色HEX
				{
					opcode: 'colorToHex',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.colorToHex'),
					arguments: {
						COLOR: {
							type: 'color',
							//defaultValue: '1',
						},
					},
				},
				//强行设置大小
				{
					opcode: 'setSize',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.setSize'),
					arguments: {
						size: {
							type: 'number',
							defaultValue: 9999,
						},
					},
					filter: ['sprite']
				},
				//强行移到xy
				{
					opcode: 'setXY',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.setXY'),
					arguments: {
						x: {
							type: 'number',
							defaultValue: 100000,
						},
						y: {
							type: 'number',
							defaultValue: 100000,
						},
					},
					filter: ['sprite']
				},
				'---' + this.formatMessage('ArkosExt.info3.5'), //🔧JSON积木
				//JSON列表长度
				{
					opcode: 'lenOfJSONList',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.lenOfJSONList'),
					arguments: {
						list: {
							type: 'string',
							defaultValue: '[1,2,"apple"]',
						}
					},
				},
				//JSON列表包含XX
				{
					opcode: 'JSONListContains',
					blockType: 'Boolean',
					text: this.formatMessage('ArkosExt.JSONListContains'),
					arguments: {
						list: {
							type: 'string',
							defaultValue: '[1,2,"apple"]',
						},
						c: {
							type: 'string',
							defaultValue: 'apple',
						}
					},
				},
				//JSON列表加入/删除
				{
					opcode: 'editJSONList',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.editJSONList'),
					arguments: {
						list: {
							type: 'string',
							defaultValue: '[1,2,"apple"]',
						},
						c: {
							type: 'string',
							defaultValue: 'apple',
						},
						type: {
							type: 'string',
							menu: 'JSONm',
						}
					},
				},
				'---' + this.formatMessage('ArkosExt.info4'), //📄数据获取
				//获取特效值
				{
					opcode: 'getEffect',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.getEffect'),
					arguments: {
						EFFECT: {
							type: 'string',
							menu: 'effectMenu',
						},
					},
				},
				//是否隐藏
				{
					opcode: 'isHiding',
					blockType: 'Boolean',
					text: this.formatMessage('ArkosExt.isHiding'),
					filter: ['sprite']
				},
				//获取旋转方式
				{
					opcode: 'getRotationStyle',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.getRotationStyle'),
					filter: ['sprite']
				},
				//获取造型0宽1高
				{
					opcode: 'getWidthOrHeight',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.getWidthOrHeight'),
					arguments: {
						t: {
							type: 'string',
							menu: 'WOrH',
						},
					},
				},
				//获取角色边缘xy
				{
					opcode: 'getBoundaryCoord',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.getBoundaryCoord'),
					arguments: {
						t: {
							type: 'string',
							menu: 'boundaryMenu',
						}
					},
					filter: ['sprite']
				},
				//是否跑到舞台外
				{
					opcode: 'isOutOfSight',
					blockType: 'Boolean',
					text: this.formatMessage('ArkosExt.isOutOfSight'),
					filter: ['sprite']
				},
				//克隆体数量
				{
					opcode: 'cloneCount',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.cloneCount')
				},
				'---' + this.formatMessage('ArkosExt.info5'), //📊排序表
				//📊清空排序表
				{
					opcode: 'clearSortedTable',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.clearSortedTable'),
					arguments: {
						list: {
							type: 'string',
							menu: 'sortedTableMenu',
						},
					},
				},
				{
					//📊排序表排序方式
					opcode: 'setTypeOfSortedTable',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.setTypeOfSortedTable'),
					arguments: {
						list: {
							type: 'string',
							menu: 'sortedTableMenu',
						},
						type: {
							type: 'string',
							menu: 'sortOrder',
						},
					},
				},
				{
					//📊将XX加入排序表
					opcode: 'addToSortedTable',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.addToSortedTable'),
					arguments: {
						list: {
							type: 'string',
							menu: 'sortedTableMenu',
						},
						name: {
							type: 'string',
							defaultValue: '小明',
						},
						value: {
							type: 'number',
							defaultValue: '95',
						},
						extra: {
							type: 'string',
							defaultValue: '20212490',
						},
					},
				},
				{
					//📊获取排序表第n项
					opcode: 'getFromSortedTableByNo',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.getFromSortedTableByNo'),
					arguments: {
						list: {
							type: 'string',
							menu: 'sortedTableMenu',
						},
						n: {
							type: 'number',
							defaultValue: 1,
						},
						t: {
							type: 'string',
							defaultValue: '1',
							menu: 'tableItemPropertyMenu',
						},
					},
				},
				{
					//📊获取排序表特定名字内容
					opcode: 'getFromSortedTableByName',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.getFromSortedTableByName'),
					arguments: {
						list: {
							type: 'string',
							menu: 'sortedTableMenu',
						},
						name: {
							type: 'string',
							defaultValue: '小明',
						},
						t: {
							type: 'string',
							defaultValue: '2',
							menu: 'tableItemPropertyMenu',
						},
					},
				},
				{
					//📊获取排序表长度
					opcode: 'lengthOfSortedTable',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.lengthOfSortedTable'),
					arguments: {
						list: {
							type: 'string',
							menu: 'sortedTableMenu',
						},
					},
				},
				{
					//📊删除表中内容
					opcode: 'deleteNameOfSortedTable',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.deleteNameOfSortedTable'),
					arguments: {
						list: {
							type: 'string',
							menu: 'sortedTableMenu',
						},
						name: {
							type: 'string',
							defaultValue: '小明',
						},
					},
				},

				'---' + this.formatMessage('ArkosExt.info6'), //🗂️ 临时数据
				//清空所有临时数据
				{
					opcode: 'deleteAllTempData',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.deleteAllTempData'),
				},
				//临时数据量
				{
					opcode: 'getCountOfTempData',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.getCountOfTempData'),
				},
				//删除临时数据
				{
					opcode: 'delTempData',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.delTempData'),
					arguments: {
						data: {
							type: 'string',
							defaultValue: 'i',
						},
					},
				},
				//判断数据存在
				{
					opcode: 'ifTempDataExist',
					blockType: 'Boolean',
					text: this.formatMessage('ArkosExt.ifTempDataExist'),
					arguments: {
						data: {
							type: 'string',
							defaultValue: 'i',
						},
					},
				},
				'---' + this.formatMessage('ArkosExt.info7'), //临时变量
				//设置临时数据
				{
					opcode: 'setTempVar',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.setTempVar'),
					arguments: {
						var: {
							type: 'string',
							defaultValue: 'i',
						},
						t: {
							type: 'string',
							defaultValue: '0',
						},
					},
				},
				//增加临时数据
				{
					opcode: 'addTempVar',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.addTempVar'),
					arguments: {
						var: {
							type: 'string',
							defaultValue: 'i',
						},
						t: {
							type: 'number',
							defaultValue: 1,
						},
					},
				},
				//获取临时数据
				{
					opcode: 'getTempVar',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.getTempVar'),
					arguments: {
						var: {
							type: 'string',
							defaultValue: 'i',
						},
					},
				},
				'---' + this.formatMessage('ArkosExt.info8'), //临时列表
				//创建或清空临时列表
				{
					opcode: 'clearTempList',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.clearTempList'),
					arguments: {
						list: {
							type: 'string',
							defaultValue: 'list',
						},
					},
				},
				//设置临时列表
				{
					opcode: 'initTempList',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.initTempList'),
					arguments: {
						list: {
							type: 'string',
							defaultValue: 'list',
						},
						t: {
							type: 'string',
							defaultValue: '[1,2,"apple"]',
						},
					},
				},
				//向临时列表加入
				{
					opcode: 'addTempList',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.addTempList'),
					arguments: {
						list: {
							type: 'string',
							defaultValue: 'list',
						},
						t: {
							type: 'string',
							defaultValue: 'thing',
						},
					},
				},
				//操作临时列表
				{
					opcode: 'opTempList',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.opTempList'),
					arguments: {
						list: {
							type: 'string',
							defaultValue: 'list',
						},
						op: {
							type: 'string',
							menu: 'ListOpMenu',
						},
						n: {
							type: 'number',
							defaultValue: 1,
						},
						t: {
							type: 'string',
							defaultValue: 'thing',
						},
					},
				},
				//删除临时列表XX项
				{
					opcode: 'delItemOfTempList',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.delItemOfTempList'),
					arguments: {
						list: {
							type: 'string',
							defaultValue: 'list',
						},
						n: {
							type: 'number',
							defaultValue: 1,
						},
					},
				},
				//获取临时列表XX项
				{
					opcode: 'getItemOfTempList',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.getItemOfTempList'),
					arguments: {
						list: {
							type: 'string',
							defaultValue: 'list',
						},
						n: {
							type: 'number',
							defaultValue: 1,
						},
					},
				},
				//临时列表长度
				{
					opcode: 'lengthOfTempList',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.lengthOfTempList'),
					arguments: {
						list: {
							type: 'string',
							defaultValue: 'list',
						},
					},
				},
				//临时列表包含xx?
				{
					opcode: 'ifListItemExist',
					blockType: 'Boolean',
					text: this.formatMessage('ArkosExt.ifListItemExist'),
					arguments: {
						list: {
							type: 'string',
							defaultValue: 'list',
						},
						c: {
							type: 'string',
							defaultValue: 'thing',
						},
					},
				},
				//获取列表第一个xx的索引
				{
					opcode: 'getListItemIdx',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.getListItemIdx'),
					arguments: {
						list: {
							type: 'string',
							defaultValue: 'list',
						},
						c: {
							type: 'string',
							defaultValue: 'thing',
						},
					},
				},
				'---' + this.formatMessage('ArkosExt.info9'), //临时容器
				//创建或清空临时容器
				{
					opcode: 'clearTempCon',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.clearTempCon'),
					arguments: {
						con: {
							type: 'string',
							defaultValue: 'con1',
						},
					},
				},
				//设置临时容器
				{
					opcode: 'initTempCon',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.initTempCon'),
					arguments: {
						con: {
							type: 'string',
							defaultValue: 'con1',
						},
						t: {
							type: 'string',
							defaultValue: '{"coins":200,"backpack":["wood","bread"]}',
						},
					},
				},
				//操作临时容器
				{
					opcode: 'opTempCon',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.opTempCon'),
					arguments: {
						con: {
							type: 'string',
							defaultValue: 'con1',
						},
						op: {
							type: 'string',
							menu: 'conOpMenu',
						},
						c: {
							type: 'string',
							defaultValue: 'coins',
						},
						t: {
							type: 'string',
							defaultValue: '520',
						},
					},
				},
				//删除临时容器名为xx的内容
				{
					opcode: 'delItemOfTempCon',
					blockType: 'command',
					text: this.formatMessage('ArkosExt.delItemOfTempCon'),
					arguments: {
						con: {
							type: 'string',
							defaultValue: 'con1',
						},
						c: {
							type: 'string',
							defaultValue: 'coins',
						},
					},
				},
				//获取临时容器名为XX的内容
				{
					opcode: 'getItemOfTempConByName',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.getItemOfTempConByName'),
					arguments: {
						con: {
							type: 'string',
							defaultValue: 'con1',
						},
						c: {
							type: 'string',
							defaultValue: 'coins',
						},
					},
				},
				//获取临时容器第n项的xx
				{
					opcode: 'getItemOfTempConByNo',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.getItemOfTempConByNo'),
					arguments: {
						con: {
							type: 'string',
							defaultValue: 'con1',
						},
						n: {
							type: 'number',
							defaultValue: 1,
						},
						t: {
							type: 'string',
							menu: 'conInfoMenu',
							defaultValue: '2',
						},
					},
				},
				//临时容器长度
				{
					opcode: 'lengthOfTempCon',
					blockType: 'reporter',
					text: this.formatMessage('ArkosExt.lengthOfTempCon'),
					arguments: {
						con: {
							type: 'string',
							defaultValue: 'con1',
						},
					},
				},
				//ifConItemExist
				{
					opcode: 'ifConItemExist',
					blockType: 'Boolean',
					text: this.formatMessage('ArkosExt.ifConItemExist'),
					arguments: {
						con: {
							type: 'string',
							defaultValue: 'con1',
						},
						c: {
							type: 'string',
							defaultValue: 'coins',
						}
					},
				},


				//
				'---' + this.formatMessage('30Ext.info'), //感谢30提供的扩展
				'---' + this.formatMessage('30Ext.info.1'), //定向缩放
				{
					opcode: 'mirrorSprite',
					blockType: 'command',
					text: this.formatMessage('30Ext.block.mirrorSprite'),
					hideFromPalette: true,
					arguments: {
						mirrorMethod: {
							type: 'string',
							defaultValue: ''
						}
					}
				},
				// 清除镜像
				{
					opcode: 'clearMirror',
					blockType: 'command',
					hideFromPalette: true,
					text: this.formatMessage('30Ext.block.clearMirror')
				},
				//获取缩放
				{
					opcode: 'getScale',
					blockType: 'reporter',
					text: this.formatMessage('30Ext.block.getScale'),
					arguments: {
						input: {
							type: 'string',
							menu: 'HVMenu',
						}
					},
					filter: ['sprite']
				},
				// x向缩放
				{
					opcode: 'scaleSpriteX',
					blockType: 'command',
					text: this.formatMessage('30Ext.block.scaleSpriteX'),
					arguments: {
						input: {
							type: 'number',
							defaultValue: '1'
						}
					},
					filter: ['sprite']
				},
				// y向缩放
				{
					opcode: 'scaleSpriteY',
					blockType: 'command',
					text: this.formatMessage('30Ext.block.scaleSpriteY'),
					arguments: {
						input: {
							type: 'number',
							defaultValue: '1'
						}
					},
					filter: ['sprite']
				},
				'---' + this.formatMessage('30Ext.info.2'), //图层管理
				//获取图层
				{
					opcode: 'getLayer',
					blockType: 'reporter',
					text: this.formatMessage('30Ext.block.getLayer'),
				},
				//设置图层
				{
					opcode: 'setLayer',
					blockType: 'command',
					text: this.formatMessage('30Ext.block.setLayer'),
					arguments: {
						input: {
							type: 'number',
							defaultValue: '1'
						}
					},
					filter: ['sprite']
				},
			],
			menus: {
				isNumMenu:[{
					text: this.formatMessage('ArkosExt.isNum'),
					value: '1'
				},
				{
					text: this.formatMessage('ArkosExt.isInt'),
					value: '2'
				}
				],
				biCalMenu: [{
					text: this.formatMessage('ArkosExt.max'),
					value: '1'
				},
				{
					text: this.formatMessage('ArkosExt.min'),
					value: '2'
				},
				{
					text: this.formatMessage('ArkosExt.diff'),
					value: '3'
				},
				{
					text: this.formatMessage('ArkosExt.sumOfSqu'),
					value: '4'
				},
				{
					text: this.formatMessage('ArkosExt.sqrtSumOfSqu'),
					value: '5'
				}
				],
				TorF: [{
					text: 'true',
					value: '1'
				},
				{
					text: 'false',
					value: '2'
				},
				],
				TorF2: [{
					text: this.formatMessage('ArkosExt.true'),
					value: '1'
				},
				{
					text: this.formatMessage('ArkosExt.false'),
					value: '0'
				},
				],
				JSONm: [{
					text: this.formatMessage('ArkosExt.JSONm1'), //加入
					value: '1'
				},
				{
					text: this.formatMessage('ArkosExt.JSONm2'), //删除
					value: '2'
				},
				],
				HVMenu: [{
					text: this.formatMessage('30Ext.block.hor'), //水平
					value: 'h'
				},
				{
					text: this.formatMessage('30Ext.block.ver'), //垂直
					value: 'v'
				},
				],
				conInfoMenu: [{
					text: this.formatMessage('ArkosExt.conInfo1'), //名称
					value: '1'
				},
				{
					text: this.formatMessage('ArkosExt.conInfo2'), //内容
					value: '2'
				},
				],
				conOpMenu: [{
					text: this.formatMessage('ArkosExt.conOp1'), //设为
					value: '1'
				},
				{
					text: this.formatMessage('ArkosExt.conOp2'), //增加
					value: '2'
				},
				],
				ListOpMenu: [{
					text: this.formatMessage('ArkosExt.ListOp1'), //插入
					value: '1'
				},
				{
					text: this.formatMessage('ArkosExt.ListOp2'), //替换
					value: '2'
				},
				{
					text: this.formatMessage('ArkosExt.ListOp3'), //增加
					value: '3'
				},
				],
				tableItemPropertyMenu: [{
					text: this.formatMessage('ArkosExt.name'),
					value: '1'
				},
				{
					text: this.formatMessage('ArkosExt.rank'),
					value: '2'
				},
				{
					text: this.formatMessage('ArkosExt.rankValue'),
					value: '3'
				},
				{
					text: this.formatMessage('ArkosExt.extra'),
					value: '4'
				},
				],
				sortOrder: [{
					text: this.formatMessage('ArkosExt.asc'),
					value: 'asc' //升序
				},
				{
					text: this.formatMessage('ArkosExt.desc'),
					value: 'desc' //降序
				},
				],
				sortedTableMenu: {
					items: 'findAllSortedTable',
					acceptReporters: true,
				},
				//判断符菜单
				opMenu1: ['<', '≤', '=', '≠', ],
				opMenu2: ['<', '>', '≤', '≥', '=', '≠', ],
				//logicMenu
				logicMenu: [{
					text: this.formatMessage('ArkosExt.or'),
					value: 'or'
				},
				{
					text: this.formatMessage('ArkosExt.and'),
					value: 'and'
				},
				],
				//角色上下左右边缘
				boundaryMenu: [{
					text: this.formatMessage('ArkosExt.top'),
					value: '1'
				},
				{
					text: this.formatMessage('ArkosExt.bottom'),
					value: '2'
				},
				{
					text: this.formatMessage('ArkosExt.left'),
					value: '3'
				},
				{
					text: this.formatMessage('ArkosExt.right'),
					value: '4'
				},
				],
				//0宽1高 菜单
				WOrH: [{
					text: this.formatMessage('ArkosExt.width'),
					value: '0'
				},
				{
					text: this.formatMessage('ArkosExt.height'),
					value: '1'
				},
				],
				//特效菜单
				effectMenu: [{
					text: this.formatMessage('ArkosExt.color'),
					value: 'color'
				},
				{
					text: this.formatMessage('ArkosExt.fisheye'),
					value: 'fisheye'
				},
				{
					text: this.formatMessage('ArkosExt.whirl'),
					value: 'whirl'
				},
				{
					text: this.formatMessage('ArkosExt.pixelate'),
					value: 'pixelate'
				},
				{
					text: this.formatMessage('ArkosExt.mosaic'),
					value: 'mosaic'
				},
				{
					text: this.formatMessage('ArkosExt.brightness'),
					value: 'brightness'
				},
				{
					text: this.formatMessage('ArkosExt.ghost'),
					value: 'ghost'
				}
				],
				//30Ext
				spritesMenu: {
					items: 'getSpritesMenu'
				}
			}
		}
	}

	/**
	 * 判断相等（区分大小写）
	 * @param {object} args
	 * @param {SCarg} args.ONE
	 * @param {SCarg} args.TWO
	 * @returns {boolean}
	 */
	strictlyEquals(args) {
		// 实际上在这里直接使用严格相等是不太明智的，因为有一定的可能会遇到数字和字符比较，
		// 而在Scratch中数字和字符在表现完全一样的时候几乎没有区别。
		// 因此包上Cast.toString()以使得数字和字符能够正常比较（类似 9 = "9" )
		return Cast.toString(args.ONE) === Cast.toString(args.TWO)
	}

	/**
	 * 计算点A到点B的方向
	 * @param {object} args
	 * @param {SCarg} args.X1
	 * @param {SCarg} args.Y1
	 * @param {SCarg} args.X2
	 * @param {SCarg} args.Y2
	 * @returns {number}
	 */
	getDirFromAToB(args) {
		// 一定要先转化为数字；
		const X1 = Cast.toNumber(args.X1)
		const X2 = Cast.toNumber(args.X2)
		const Y1 = Cast.toNumber(args.Y1)
		const Y2 = Cast.toNumber(args.Y2)

		// 这里利用atan函数的性质atan(+inf)=90,atan(-inf)=-90,atan(NaN)=NaN可以省很多代码
		let a = Math.atan((X2 - X1) / (Y2 - Y1)) / Math.PI * 180 + (Y1 > Y2 ? 180 : 0)
		if(a > 180) a -= 360
		return a;
	}

	/**
	 * 计算角b-角a的角度差
	 * @param {object} args
	 * @param {SCarg} args.a
	 * @param {SCarg} args.b
	 * @returns {number}
	 */
	differenceBetweenDirections(args) {
		const a = Cast.toNumber(args.a)
		const b = Cast.toNumber(args.b)
		let dif = b - a
		dif -= Math.round(dif / 360) * 360
		if(dif === -180) dif = 180
		return dif
	}

	/**
	 * 两点距离
	 * @param {object} args
	 * @param {SCarg} args.X1
	 * @param {SCarg} args.Y1
	 * @param {SCarg} args.X2
	 * @param {SCarg} args.Y2
	 * @returns {number}
	 */
	disFromAToB(args) {
		const X1 = Cast.toNumber(args.X1)
		const X2 = Cast.toNumber(args.X2)
		const Y1 = Cast.toNumber(args.Y1)
		const Y2 = Cast.toNumber(args.Y2)
		return Math.sqrt((X1 - X2) * (X1 - X2) + (Y1 - Y2) * (Y1 - Y2))
	}

	/**
	 * 查找子字符串，从pos开始
	 * @param {object} args
	 * @param {SCarg} args.str
	 * @param {SCarg} args.substr
	 * @param {SCarg} args.pos
	 * @returns {number}
	 */
	indexof(args) {
		const str = Cast.toString(args.str)
		const substr = Cast.toString(args.substr)
		const a = str.indexOf(substr, Cast.toNumber(args.pos) - 1)
		if(a === -1) {
			// Scratch列表中也有查询积木，其中找不到返回的是0。建议维持原有的风格。
			return 0
		}
		return a + 1
	}

	/**
	 * 在字符串中插入子字符串
	 * @param {object} args
	 * @param {SCarg} args.str
	 * @param {SCarg} args.substr
	 * @param {SCarg} args.pos
	 * @returns {string}
	 */
	insertStr(args) {
		const str = Cast.toString(args.str)
		const substr = Cast.toString(args.substr)
		let pos = Cast.toNumber(args.pos) - 1
		if(pos < 0) {
			pos = 0
		}
		return str.slice(0, pos) + substr + str.slice(pos)
	}

	/**
	 * 替换字符串中的从..到..的字符串
	 * @param {object} args
	 * @param {SCarg} args.str
	 * @param {SCarg} args.substr
	 * @param {SCarg} args.start
	 * @param {SCarg} args.end
	 * @returns {string}
	 */
	replaceStr(args) {
		const str = Cast.toString(args.str)
		const substr = Cast.toString(args.substr)
		let start = Cast.toNumber(args.start)
		let end = Cast.toNumber(args.end)
		if(start > end) {
			const t = end
			end = start
			start = t
		}
		if(start < 1) start = 1
		return str.slice(0, start - 1) + substr + str.slice(end)
	}


	/**
	 * 朝..方向旋转..角度
	 * @param {object} args
	 * @param {SCarg} args.degree
	 * @param {SCarg} args.dir
	 * @param {Util} util
	 * @returns {void}
	 */
	turnDegreesToDir(args, util) {
		const degree = Cast.toNumber(args.degree);
		const dir = Cast.toNumber(args.dir);
		const dif = this.differenceBetweenDirections({
			a: util.target.direction,
			b: dir
		});
		if(Math.abs(dif) < degree)
			util.target.setDirection(dir);
		else if(dif < 0)
			util.target.setDirection(util.target.direction - degree);
		else
			util.target.setDirection(util.target.direction + degree);
	}

	/**
	 * 获取特效的数值
	 * @param {object} args
	 * @param {SCarg} args.EFFECT
	 * @param {Util} util
	 * @returns {number}
	 */
	getEffect(args, util) {
		const effect = Cast.toString(args.EFFECT)
			.toLowerCase();
		if(!Object.prototype.hasOwnProperty.call(util.target.effects, effect)) return 0;
		return util.target.effects[effect];
	}

	/**
	 * 是否隐藏
	 * @param {object} args
	 * @param {Util} util
	 * @returns {boolean}
	 */
	// @ts-ignore 不需要使用 args
	isHiding(args, util) {
		return !util.target.visible;
	}


	/**
	 * 获取当前角色的旋转方式
	 * @param {object} args
	 * @param {Util} util
	 * @returns {string}
	 */
	// @ts-ignore 不需要使用 args
	getRotationStyle(args, util) {
		return util.target.rotationStyle;
	}

	/**
	 * 获取造型0宽1高
	 * @param {object} args
	 * @param {SCarg} args.t
	 * @param {Util} util
	 * @returns {number}
	 */
	getWidthOrHeight(args, util) {
		const costumeSize = util.target.renderer.getCurrentSkinSize(util.target.drawableID);
		return costumeSize[Number(args.t)];
	}

	/**
	 * 强行设置大小
	 * @param {object} args
	 * @param {SCarg} args.size
	 * @param {Util} util
	 * @returns {void}
	 */
	setSize(args, util) {
		if(util.target.isStage) {
			return;
		}
		if(util.target.renderer) {
			args.size = this._clamp(Cast.toNumber(args.size), 0.1, 100000000)
			util.target.size = args.size;
			const {
				direction,
				scale
			} = util.target._getRenderedDirectionAndScale();
			util.target.renderer.updateDrawableDirectionScale(util.target.drawableID, direction, scale);
			if(util.target.visible) {
				util.target.emit('EVENT_TARGET_VISUAL_CHANGE', util.target);
				util.target.runtime.requestRedraw();
			}
		}
		util.target.runtime.requestTargetsUpdate(util.target);
	}

	/**
	 * 将 n 的值限制在 min 和 max 之间
	 * @param {number} n
	 * @param {number} min
	 * @param {number} max
	 * @returns {number}
	 */
	_clamp(n, min, max) {
		return Math.min(Math.max(n, min), max);
	}

	/**
	 * 强行移到xy
	 * @param {object} args
	 * @param {SCarg} args.x
	 * @param {SCarg} args.y
	 * @param {Util} util
	 * @returns {void}
	 */
	setXY(args, util) {
		if(util.target.isStage) return;
		args.x = this._clamp(Cast.toNumber(args.x), -100000000, 100000000)
		args.y = this._clamp(Cast.toNumber(args.y), -100000000, 100000000)
		const oldX = util.target.x;
		const oldY = util.target.y;
		util.target.x = args.x;
		util.target.y = args.y;
		if(util.target.renderer) {
			util.target.renderer.updateDrawablePosition(util.target.drawableID, [args.x, args.y]);
			if(util.target.visible) {
				util.target.emit('EVENT_TARGET_VISUAL_CHANGE', util.target);
				util.target.runtime.requestRedraw();
			}
		}
		util.target.emit('TARGET_MOVED', util.target, oldX, oldY, false);
		util.target.runtime.requestTargetsUpdate(util.target);
	}

	/**
	 * 获取角色边缘的坐标
	 * @param {object} args
	 * @param {SCarg} args.t
	 * @param {Util} util
	 * @returns {number}
	 */
	getBoundaryCoord(args, util) {
		const bounds = util.target.runtime.renderer.getBounds(util.target.drawableID);
		switch (args.t) {
		case '1':
			return bounds.top;
		case '2':
			return bounds.bottom;
		case '3':
			return bounds.left;
		case '4':
			return bounds.right;
		default:
			return '';
		}
	}

	/**
	 * 是否在舞台外
	 * @param {object} args
	 * @param {Util} util
	 * @returns {boolean}
	 */
	// @ts-ignore 不需要使用 args
	isOutOfSight(args, util) {
		// console.log(util.target.runtime.renderer)
		// console.log(util.target.renderer)
		if(util.target.renderer) {
			const stageWidth = util.target.runtime.stageWidth;
			const stageHeight = util.target.runtime.stageHeight;
			const bounds = util.target.runtime.renderer.getBounds(util.target.drawableID);
			if(bounds.right < -stageWidth / 2 ||
				bounds.left > stageWidth / 2 ||
				bounds.bottom > stageHeight / 2 ||
				bounds.top < -stageHeight / 2) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 克隆体数量
	 * @returns {number}
	 */
	cloneCount(){
		return this.runtime._cloneCounter;
	}

	/**
	 * （隐藏）返回值转bool积木
	 * （废弃）形如：<() >
	 * @param {object} args
	 * @param {SCarg} args.t
	 * @returns {boolean}
	 */
	reporterToBoolean(args) {
		const t = Cast.toString(args.t).toLowerCase()
		if(t === 'false'||t === '0'||t === 'undefined'||t === 'null'||t === '') return false;
		return (args.t) ? true : false;
	}

	/**
	 * 形如：<()成立/不成立 >
	 * @param {object} args
	 * @param {SCarg} args.t
	 * @param {SCarg} args.type
	 * @returns {boolean}
	 */
	reporterToBoolean2(args) {
		const t = Cast.toString(args.t).toLowerCase()
		let b
		if(t === 'false'||t === '0'||t === 'undefined'||t === 'null'||t === '') b = false;
		else b = (args.t) ? true : false;
		return (args.type === '1')? b : (!b);
	}

	/**
	 * 没有被使用
	 * @param {object} args
	 * @param {SCarg} args.t
	 * @param {SCarg} args.type
	 * @returns {boolean}
	 */
	trueOrFalse(args) {
		return (args.type === '1')? true : false;
	}

	/**
	 * 用指定运算符比较 a 和 b
	 * @param {SCarg} a
	 * @param {SCarg} b
	 * @param {SCarg} op 比较运算符，< > = ≤ ≥ ≠
	 * @returns {boolean}
	 */
	compare(a, b, op) {
		switch (op) {
		case '<':
			return Cast.compare(a, b) < 0;
		case '>':
			return Cast.compare(a, b) > 0;
		case '=':
			return Cast.compare(a, b) === 0;
		case '≤':
			return Cast.compare(a, b) <= 0;
		case '≥':
			return Cast.compare(a, b) >= 0;
		case '≠':
			return Cast.compare(a, b) !== 0;
		default:
			return false;
		}
	}

	/**
	 * 二元运算符
	 * @param {object} args
	 * @param {SCarg} args.cal 运算符（1最大，2最小，3差的绝对值，4平方和，5平方和的开方）
	 * @param {SCarg} args.a
	 * @param {SCarg} args.b
	 * @returns {SCarg}
	 */
	binaryCal(args){
		const a = Cast.toNumber(args.a)
		const b = Cast.toNumber(args.b)
		switch (args.cal) {
		case '1':
			return (Cast.compare(args.a, args.b) > 0) ? args.a : args.b; //max
		case '2':
			return (Cast.compare(args.a, args.b) > 0) ? args.b : args.a; //min
		case '3':
			return Math.abs(a-b);//差
		case '4':
			return a*a+b*b;//平方和
		default:
			return Math.sqrt(a*a+b*b);//平方和开方
		}
	}

	/**
	 * 默认值，如果 c 是空白，就返回 d，否则返回 c
	 * @param {object} args
	 * @param {SCarg} args.c
	 * @param {SCarg} args.d
	 * @returns {SCarg}
	 */
	defaultValue(args){
		return (args.c === '')? args.d : args.c;
	}

	/**
	 * 判断是否是数字
	 * @param {object} args
	 * @param {SCarg} args.c
	 * @param {SCarg} args.type
	 * @returns {boolean}
	 */
	isNum(args){
		if(args.type === '1')
		{
			return !isNaN(Number(args.c));
		}
		if(args.type === '2')
		{
			if(isNaN(Number(args.c))) return false;
			return Cast.isInt(args.c);
		}
		return false;
	}

	/**
	 * 取符号。负数为-1,0和正数为1
	 * @param {object} args
	 * @param {SCarg} args.c
	 * @returns {-1|1}
	 */
	sgn(args){
		const c = Cast.toNumber(args.c)
		return c<0 ? -1 : 1; 

	}

	/**
	 * 概率
	 * @param {object} args
	 * @param {SCarg} args.p
	 * @returns {boolean}
	 */
	probability(args){
		const p = Cast.toNumber(args.p)
		if(p===1) return true;
		if(p===0) return false;
		return (Math.random() < p)? true : false;
	}

	/**
	 * 积木暂时隐藏，不上线
	 * （有bug暂时隐藏）按下x键且上次没按
	 * @param {object} args
	 * @param {SCarg} args.key
	 * @param {Util} util
	 * @returns {boolean}
	 */
	getKeyDown (args, util) {
		let flag = false
		const pressed =  util.ioQuery('keyboard', 'getKeyIsDown', [args.key]);
		if(!this.lastKeyPressed[Cast.toString(args.key)] && pressed) flag = true; //这一帧按下，且上一帧未按下
		this.lastKeyPressed[Cast.toString(args.key)] = pressed
		return flag;
	}

	/**
	 * 检测值变化
	 * 暂时不知如何实现
	 * @param {object} args
	 * @param {SCarg} args.c
	 * @param {Util} util
	 * @returns {boolean}
	 */
	// @ts-ignore 不需要使用 args
	dataChanged(args, util){
		// let cached = util.target.blocks._cache._executeCached
		// console.log(Object.keys(cached)[0])
		// console.log(util.target.blocks._cache)
		console.log(util.target.blocks)
		return false;
	}

	/**
	 * xxx,xx,xx 包含xx？
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.ch
	 * @param {SCarg} args.c
	 * @returns {boolean}
	 */
	contain(args) {
		const list = Cast.toString(args.list).split(Cast.toString(args.ch))
		return this._ifListItemExist(list, Cast.toString(args.c))
	}

	/**
	 * JSON列表长度
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @returns {number}
	 */
	lenOfJSONList(args) {
		try {
			const list = JSON.parse(Cast.toString(args.list))
			if(typeof(list) === 'object' && list !== null) {
				return Object.keys(list).length;
			}
			return 0;
		} catch (e) {
			return 0;
		}
	}


	/**
	 * JSON列表包含XX
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.c
	 * @returns {boolean}
	 */

	JSONListContains(args) {
		try {
			const list = JSON.parse(Cast.toString(args.list))
			if(Array.isArray(list)) {
				return this._ifListItemExist(list, Cast.toString(args.c));
			}
			return false;
		} catch (e) {
			return false;
		}
	}

	/**
	 * JSON列表加入/删除
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.c
	 * @param {SCarg} args.type
	 * @returns {string}
	 */
	editJSONList(args) {
		try {
			const list = JSON.parse(Cast.toString(args.list))
			if(Array.isArray(list)) {
				const item = this._anythingToNumberString(args.c)
				if(args.type === '1') //加入列表
				{
					list.push(item);
				}
				if(args.type === '2') //从列表删除
				{
					const idx = this._getListItemIdx(list, item) - 1
					if(idx >= 0) list.splice(idx, 1);
				}
				return JSON.stringify(list);
			}
			return '';
		} catch (e) {
			return '';
		}
	}

	/**
	 * 形如：a≤b≤c op1,op2
	 * @param {object} args
	 * @param {SCarg} args.a
	 * @param {SCarg} args.b
	 * @param {SCarg} args.c
	 * @param {SCarg} args.op1
	 * @param {SCarg} args.op2
	 * @returns {boolean}
	 */
	compareTwoSides(args) {
		return this.compare(args.a, args.b, args.op1) && this.compare(args.b, args.c, args.op2)
	}


	/**
	 * 形如：a≤b且/或>c op1,op2 logic
	 * @param {object} args
	 * @param {SCarg} args.a
	 * @param {SCarg} args.b
	 * @param {SCarg} args.c
	 * @param {SCarg} args.op1
	 * @param {SCarg} args.op2
	 * @param {SCarg} args.logic
	 * @returns {boolean}
	 */
	compareTwoSidesPlus(args) {
		switch (args.logic) {
		case 'or':
			return this.compare(args.a, args.b, args.op1) || this.compare(args.a, args.c, args.op2)
		case 'and':
			return this.compare(args.a, args.b, args.op1) && this.compare(args.a, args.c, args.op2)
		default:
			return false;
		}
	}

	/**
	 * 数组排序规则（生成排序函数）
	 * @template {string} T
	 * @param {T} propName 属性名称
	 * @param {'asc'|'desc'} order 排序方式
	 * @returns {(a: {[key in T]: SCarg}, b: {[key in T]: SCarg}) => number}
	 */
	sortRule(propName, order) {
		return (a, b) => {
			const A = a[propName]
			const B = b[propName]
			if(A > B) return order === 'asc' ? 1 : -1;
			else if(A < B) return order === 'asc' ? -1 : 1;
			else return 0;
		}
	}

	//查找所有排序表
	findAllSortedTable() {
		const list = [];
		const temp = this.sortedTable;
		Object.keys(temp)
			.forEach(obj => {
				//if ( Array.isArray (temp[obj]) ) {
				list.push(obj);
				//}
			});
		if(list.length === 0) {
			list.push({
				text: '-',
				value: 'empty',
			});
		}
		//list.sort(this.sortRule("text"));
		return list;
	}


	/**
	 * 获得排序表，如果排序表不存在就建立一个
	 * @param {string} list
	 * @returns {SortedTable}
	 */
	getOrCreateTable(list) {
		const origlist = this.sortedTable[list];
		if(origlist !== undefined)
			return origlist;

		/** @type {SortedTable} */
		const newlist = {
			order: "desc",
			list: []
		};
		this.sortedTable[list] = newlist;
		return newlist;
	}

	/**
	 * 排序某个排序表
	 * @param {string} listname 排序表名称
	 */
	sortTable(listname) {
		const list = this.sortedTable[listname];
		if(list === undefined) {
			console.warn(`找不到排序表 ${list}`);
			return;
		}
		list.list.sort(this.sortRule("rankValue", list.order));

	}

	/**
	 * 📊清空排序表
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @returns {void}
	 */
	clearSortedTable(args) {
		const listname = Cast.toString(args.list);
		const list = this.getOrCreateTable(listname)
		list.list = [];
	}

	/**
	 * 📊设置排序方式
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.type
	 * @returns {void}
	 */
	setTypeOfSortedTable(args) {
		const listname = Cast.toString(args.list);
		const list = this.getOrCreateTable(listname)
		list.order = args.type;
		this.sortTable(listname)
	}

	/**
	 * 查找在列表中的插入位置（已有则覆盖）
	 * @param {SortedTableItem[]} list 排序表
	 * @param {'asc'|'desc'} order 排序方式
	 * @param {SortedTableItem} item 要插入的项目
	 * @returns {void}
	 */
	_findPlaceAndInsert(list, order, item) {
		//删除已存在的内容
		for(const [i, listi] of list.entries()) {
			if(listi.name === item.name) {
				//删除同名项
				list.splice(i, 1);
				break;
			}
		}
		//查找插入位置并插入
		for(const [i, listi] of list.entries()) {
			if((listi.rankValue > item.rankValue && order === 'asc') ||
				(listi.rankValue < item.rankValue && order === 'desc')) {
				//插入在该项前
				list.splice(i, 0, item);
				return;
			}
		}
		//没找到插入位置，加在末尾
		list.push(item);
	}

	/**
	 * 📊将XX加入排序表
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.name
	 * @param {SCarg} args.value
	 * @param {SCarg} args.extra
	 * @returns {void}
	 */
	addToSortedTable(args) {
		const listname = Cast.toString(args.list);
		const list = this.getOrCreateTable(listname)
		this._findPlaceAndInsert(
			list.list,
			list.order, {
				name: args.name,
				rankValue: Cast.toNumber(args.value),
				extra: args.extra
			});
	}

	/**
	 * 获取项目的属性
	 * @param {SortedTableItem} item 项目
	 * @param {SCarg} t 属性
	 * @param {number} rank 排名
	 * @returns {SCarg}
	 */
	_getTInItem(item, t, rank) {
		if(item === undefined) return '';
		switch (t) {
		case '1':
			return item.name;
		case '2':
			return rank;
		case '3':
			return item.rankValue;
		case '4':
			return item.extra;
		default:
			return '';
		}
	}

	/**
	 * 📊获取排序表第n项
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.n
	 * @param {SCarg} args.t
	 * @returns {SCarg}
	 */
	getFromSortedTableByNo(args) {
		const listname = Cast.toString(args.list);
		const list = this.sortedTable[listname];
		if(list === undefined) {
			return '';
		}
		const item = list.list[Cast.toNumber(args.n) - 1];
		if(item === undefined) {
			return '';
		}
		return this._getTInItem(item, args.t, Cast.toNumber(args.n));
	}

	/**
	 * 获取第一个指定名称的项以及它的编号
	 * @param {SortedTableItem[]} list 排序表
	 * @param {SCarg} name
	 * @returns {[number, SortedTableItem] | undefined}
	 */
	_getItemAndIdxByName(list, name) {
		for(const [i, listi] of list.entries()) {
			if(listi.name === name) {
				return [i, listi];
			}
		}
		return undefined;
	}

	/**
	 * 获取第一个指定名称的编号
	 * @param {SortedTableItem[]} list 排序表
	 * @param {SCarg} name
	 * @returns {number}
	 */
	_getItemIdxByName(list, name) {
		for(const [i, listi] of list.entries()) {
			if(listi.name === name) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * 📊获取排序表特定名字内容
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.name
	 * @param {SCarg} args.t
	 * @returns {SCarg}
	 */
	getFromSortedTableByName(args) {
		const listname = Cast.toString(args.list);
		const table = this.sortedTable[listname];
		if(table === undefined) return '';
		const idx_item = this._getItemAndIdxByName(table.list, args.name);
		if(idx_item === undefined) return '';
		const [n, item] = idx_item;
		return this._getTInItem(item, args.t, n + 1);
	}

	/**
	 * 📊获取排序表长度
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @returns {number}
	 */
	lengthOfSortedTable(args) {
		const listname = Cast.toString(args.list);
		const table = this.sortedTable[listname];
		if(table === undefined) return 0;
		return table.list.length;
	}

	/**
	 * 📊删除排序表名为XX的内容
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.name
	 * @returns {void}
	 */
	deleteNameOfSortedTable(args) {
		const listname = Cast.toString(args.list);
		const table = this.sortedTable[listname];
		if(table === undefined) return;
		const n = this._getItemIdxByName(table.list, args.name);
		if(n === -1) return;
		table.list.splice(n, 1);
	}

	/**
	 * 获取颜色HEX码
	 * @param {object} args
	 * @param {SCarg} args.COLOR
	 * @returns {string}
	 */
	colorToHex(args) {
		const c = Cast.toRgbColorList(args.COLOR)
		return Color.rgbToHex({
			r: c[0] ?? 0,
			g: c[1] ?? 0,
			b: c[2] ?? 0
		});
	}


	//🗂️ 临时变量积木

	/**
	 * 来自 -6 ：任意内容转字符或数字
	 * @param {unknown} value
	 * @returns {string|number}
	 */
	_anythingToNumberString(value) {
		switch (typeof(value)) {
		case 'string':
		case 'number':
			break;
		case 'object':
			value = JSON.stringify(value);
			break;
		default:
			value = ''; //包含了undefined
		}
	}

	/**
	 * 清空所有临时数据
	 * @param {object} args
	 * @returns {void}
	 */
	// @ts-ignore 不需要使用 args
	deleteAllTempData(args) {
		this.tempData = {};
	}

	/**
	 * 临时数据量
	 * @param {object} args
	 * @returns {number}
	 */
	// @ts-ignore 不需要使用 args
	getCountOfTempData(args) {
		return Object.keys(this.tempData)
			.length;
	}

	/**
	 * 删除临时数据
	 * @param {object} args
	 * @param {SCarg} args.data
	 * @returns {void}
	 */
	delTempData(args) {
		delete this.tempData[Cast.toString(args.data)];
	}

	/**
	 * 判断数据存在
	 * @param {object} args
	 * @param {SCarg} args.data
	 * @returns {boolean}
	 */
	ifTempDataExist(args) {
		return Object.prototype.hasOwnProperty.call(this.tempData, Cast.toString(args.data));
	}

	/**
	 * 设置临时数据
	 * @param {object} args
	 * @param {SCarg} args.var
	 * @param {SCarg} args.t
	 * @returns {void}
	 */
	setTempVar(args) {
		this.tempData[Cast.toString(args.var)] = args.t;
	}

	/**
	 * 增加临时数据
	 * @param {object} args
	 * @param {SCarg} args.var
	 * @param {SCarg} args.t
	 * @returns {void}
	 */
	addTempVar(args) {
		this.tempData[Cast.toString(args.var)] = Cast.toNumber(this.tempData[Cast.toString(args.var)]) + Cast.toNumber(args.t);
	}

	/**
	 * 获取临时数据
	 * @param {object} args
	 * @param {SCarg} args.var
	 * @returns {SCarg}
	 */
	getTempVar(args) {
		const temp = this.tempData[Cast.toString(args.var)]
		if(typeof(temp) === 'object') return JSON.stringify(temp);
		return Cast.toString(temp);
	}

	/**
	 * 创建或清空临时列表
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @returns {void}
	 */
	clearTempList(args) {
		this.tempData[Cast.toString(args.list)] = [];
	}

	/**
	 * 设置临时列表
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.t
	 * @returns {void}
	 */
	initTempList(args) {
		try {
			const content = JSON.parse(Cast.toString(args.t))
			if(Array.isArray(content)) {
				this.tempData[Cast.toString(args.list)] = content;
			} else {
				console.warn("设置临时列表失败");
			}
		} catch (e) {
			console.warn("设置临时列表失败", e);
		}
	}

	/**
	 * 向临时列表加入
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.t
	 * @returns {void}
	 */
	addTempList(args) {
		const list = this.tempData[Cast.toString(args.list)]
		if(!Array.isArray(list)) return;
		list.push(Cast.toString(args.t));
	}

	/**
	 * 操作临时列表
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.op
	 * @param {SCarg} args.n
	 * @param {SCarg} args.t
	 * @returns {void}
	 */
	opTempList(args) {
		const list = this.tempData[Cast.toString(args.list)]
		if(!Array.isArray(list)) return;
		let n = Cast.toNumber(args.n)
		if(n < 1 || n > list.length + 1) return;
		n -= 1;
		switch (args.op) {
		case '1': //插入
			list.splice(n, 0, args.t);
			return;
		case '2': //替换
			list[n] = args.t;
			return;
		case '3': //增加
			list[n] = Cast.toNumber(list[n]) + Cast.toNumber(args.t);
			return;
		default:
			return;
		}
	}

	/**
	 * 删除临时列表XX项
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.n
	 * @returns {void}
	 */
	delItemOfTempList(args) {
		const list = this.tempData[Cast.toString(args.list)]
		if(!Array.isArray(list)) return;
		let n = Cast.toNumber(args.n)
		if(n < 1 || n > list.length) return;
		n -= 1;
		list.splice(n, 1);
	}

	/**
	 * 获取临时列表XX项
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.n
	 * @returns {SCarg}
	 */
	getItemOfTempList(args) {
		const list = this.tempData[Cast.toString(args.list)]
		if(!Array.isArray(list)) return '';
		let n = Cast.toNumber(args.n)
		if(n < 1 || n > list.length) return '';
		n -= 1;
		return Cast.toString(list[n]);
	}

	/**
	 * 临时列表长度
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @returns {number}
	 */
	lengthOfTempList(args) {
		const list = this.tempData[Cast.toString(args.list)]
		if(!Array.isArray(list)) return 0;
		return list.length;
	}

	/**
	 * 检查list是否包含item
	 * @param {SCarg[]} list
	 * @param {SCarg} item
	 * @returns {boolean}
	 */
	_ifListItemExist(list, item) {
		if (list.indexOf(item) >= 0) {
			return true;
		}
		// Try using Scratch comparison operator on each item.
		// (Scratch considers the string '123' equal to the number 123).
		for (let i = 0; i < list.length; i++) {
			if (Cast.compare(list[i], item) === 0) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 临时列表包含xx?
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.c
	 * @returns {boolean}
	 */
	ifListItemExist(args) {
		const list = this.tempData[Cast.toString(args.list)]
		if(!Array.isArray(list)) return false;
		const item = Cast.toString(args.c)

		return this._ifListItemExist(list, item)
	}

	/**
	 * 检查list是否包含item
	 * @param {SCarg[]} list
	 * @param {SCarg} item
	 * @returns {number}
	 */
	_getListItemIdx(list, item) {
		for (let i = 0; i < list.length; i++) {
			if (Cast.compare(list[i], item) === 0) {
				return i + 1;
			}
		}
		return 0;
	}

	/**
	 * 获取列表第一个xx的索引
	 * @param {object} args
	 * @param {SCarg} args.list
	 * @param {SCarg} args.c
	 * @returns {number}
	 */
	getListItemIdx(args) {
		const list = this.tempData[Cast.toString(args.list)]
		if(!Array.isArray(list)) return 0;
		const item = Cast.toString(args.c)

		return this._getListItemIdx(list, item)

	}

	/**
	 * 创建或清空临时容器
	 * @param {object} args
	 * @param {SCarg} args.con
	 * @returns {void}
	 */
	clearTempCon(args) {
		this.tempData[Cast.toString(args.con)] = {};
	}

	/**
	 * 设置临时容器
	 * @param {object} args
	 * @param {SCarg} args.con
	 * @param {SCarg} args.t
	 * @returns {void}
	 */
	initTempCon(args) {
		try {
			const content = JSON.parse(Cast.toString(args.t))
			if(typeof(content) === 'object' && content !== null) {
				this.tempData[Cast.toString(args.con)] = content;
			} else {
				console.warn("设置临时容器失败");
			}
		} catch (e) {
			console.warn("设置临时容器失败", e);
		}
	}

	/**
	 * 操作临时容器
	 * @param {object} args
	 * @param {SCarg} args.con
	 * @param {SCarg} args.op
	 * @param {SCarg} args.c
	 * @param {SCarg} args.t
	 * @returns {void}
	 */
	opTempCon(args) {
		const con = this.tempData[Cast.toString(args.con)]
		if(!(typeof(con) === 'object' && !Array.isArray(con) && con !== null)) return;
		const c = Cast.toString(args.c)
		switch (args.op) {
		case '1': //设为
			con[c] = args.t;
			return;
		case '2': //增加
			if(!(c in con)) return;
			con[c] = Cast.toNumber(con[c]) + Cast.toNumber(args.t);
			return;
		default:
			return;
		}
	}

	/**
	 * 删除临时容器名为xx的内容
	 * @param {object} args
	 * @param {SCarg} args.con
	 * @param {SCarg} args.c
	 * @returns {void}
	 */
	delItemOfTempCon(args) {
		const con = this.tempData[Cast.toString(args.con)]
		if(!(typeof(con) === 'object' && !Array.isArray(con) && con !== null)) return;
		delete con[Cast.toString(args.c)];
	}

	/**
	 * 获取临时容器名为XX的内容
	 * @param {object} args
	 * @param {SCarg} args.con
	 * @param {SCarg} args.c
	 * @returns {SCarg}
	 */
	getItemOfTempConByName(args) {
		const con = this.tempData[Cast.toString(args.con)]
		if(!(typeof(con) === 'object' && !Array.isArray(con) && con !== null)) return '';
		return this._anythingToNumberString(con[Cast.toString(args.c)]);
	}

	/**
	 * 获取临时容器第n项的xx
	 * @param {object} args
	 * @param {SCarg} args.con
	 * @param {SCarg} args.n
	 * @param {SCarg} args.t
	 * @returns {SCarg}
	 */
	getItemOfTempConByNo(args) {
		const con = this.tempData[Cast.toString(args.con)]
		if(!(typeof(con) === 'object' && !Array.isArray(con) && con !== null)) return '';
		const key = Object.keys(con)[Cast.toNumber(args.n) - 1]
		if(key === undefined) return '';
		switch (args.t) {
		case '1': //名称
			return key;
		case '2': //内容
			return this._anythingToNumberString(con[key]);
		default:
			return;
		}
	}

	/**
	 * 临时容器长度
	 * @param {object} args
	 * @param {SCarg} args.con
	 * @returns {number}
	 */
	lengthOfTempCon(args) {
		const con = this.tempData[Cast.toString(args.con)]
		if(!(typeof(con) === 'object' && con !== null)) return 0;
		return Object.keys(con).length;
	}

	/**
	 * ifConItemExist
	 * @param {object} args
	 * @param {SCarg} args.con
	 * @param {SCarg} args.c
	 * @returns {boolean}
	 */
	ifConItemExist(args) {
		const con = this.tempData[Cast.toString(args.con)]
		if(!(typeof(con) === 'object' && con !== null)) return false;
		return Object.prototype.hasOwnProperty.call(con, Cast.toString(args.c));
	}


	//
	//30Ext
	//
	//菜单
	//动态菜单: 角色菜单
	getSpritesMenu() {
		var sprites = [];
		for(const target of Object.values(this.runtime.targets)) {
			if(!target.isOriginal) continue;
			if(target === this.runtime._editingTarget) continue; //排除自己
			const name = target.sprite.name;
			sprites.push(name); //['Stage','角色1','角色2'] Stage暂时懒得换成中文
		}
		return sprites;
	}

	//
	//角色造型操作
	//

	/**
	 * 清除镜像
	 * @returns {void}
	 */
	clearMirror(){
		console.warn('镜像积木已下线，请使用新积木\nMirror block is offline, please use new blocks.');
	}

	/**
	 * 定向缩放
	 * @param {object} args
	 * @param {SCarg} args.mirrorMethod
	 * @returns {void}
	 */
	mirrorSprite(){
		console.warn('镜像积木已下线，请使用新积木\nMirror block is offline, please use new blocks.');
	}

	/**
	 * 获取缩放
	 * @param {object} args
	 * @param {SCarg} args.input
	 * @param {Util} util
	 * @returns {number}
	 */
	getScale(args, util) {
		const drawable = this.runtime.renderer._allDrawables[util.target.drawableID]
		if(!drawable.ext30_scale) return 1
		else if(args.input === 'v') return drawable.ext30_scale[1]
		else return drawable.ext30_scale[0]
	}

	/**
	 * 拉伸造型
	 * @param {0|1} index 宽0/高1
	 * @param {number} value 缩放比例
	 * @param {Util} util
	 */
	scaleSprite(index, value, util) {
		const target = util.target;
		const drawable = this.runtime.renderer._allDrawables[target.drawableID];
		if(!drawable.ext30_scale) {
			drawable.ext30_scale = [1,1];
			drawable.ext30_rawScale = drawable.scale;
			//注入修改函数
			const old_fun = drawable.__proto__.updateScale;
			Object.defineProperty(drawable, "updateScale" ,
				{value: function(/** @type {[number, number]} */ scale) {
					this.ext30_rawSize = scale[0];
					scale[0] = this.ext30_rawSize * this.ext30_scale[0];
					scale[1] = this.ext30_rawSize * this.ext30_scale[1];
					return old_fun.call(this, scale);
				}}
			);
		}
		drawable.ext30_scale[index] = value;
		//更新
		drawable.updateScale([target.size, target.size]);
	}

	/**
	 * x向缩放
	 * @param {object} args
	 * @param {SCarg} args.input
	 * @param {Util} util
	 * @returns {void}
	 */
	scaleSpriteX(args, util) {
		this.scaleSprite(0, Cast.toNumber(args.input), util);
	}

	/**
	 * y向缩放
	 * @param {object} args
	 * @param {SCarg} args.input
	 * @param {Util} util
	 * @returns {void}
	 */
	scaleSpriteY(args, util) {
		this.scaleSprite(1, Cast.toNumber(args.input), util);
	}
	//
	//图层操作
	//

	/**
	 * 获取图层
	 * @param {object} args
	 * @param {Util} util
	 * @returns {number}
	 */
	// @ts-ignore 不需要使用 args
	getLayer(args, util) {
		return util.target.getLayerOrder();
	}

	/**
	 * 设置图层
	 * @param {object} args
	 * @param {SCarg} args.input
	 * @param {Util} util
	 * @returns {void}
	 */
	setLayer(args, util) {
		util.target.renderer.setDrawableOrder(util.target.drawableID, args.input, 'sprite');
	}
}



window.tempExt = {
	Extension: ArkosExtensions,
	info: {
		name: 'hcn.extensionName',
		description: 'hcn.description',
		extensionId: extensionId,
		// iconURL: icon,
		// insetIconURL: cover,
		featured: true,
		disabled: false,
		collaborator: 'only for hcn test',
	},
	l10n: {
		'zh-cn': {
			'hcn.extensionName': 'hcn 的测试',
			'hcn.description': 'hcn 的测试',
		},
		en: {
			'hcn.extensionName': 'hcn test',
			'hcn.description': 'hcn test',
		},
	},
}
