<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  Activity,
  Cable,
  Check,
  ChevronRight,
  CircleHelp,
  CircuitBoard,
  Copy,
  Download,
  ExternalLink,
  FilePlus2,
  GitBranch,
  Globe2,
  Lightbulb,
  Maximize2,
  Minimize2,
  Minus,
  Moon,
  MousePointer2,
  PanelBottomClose,
  PanelBottomOpen,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Plus,
  Redo2,
  Search,
  Settings2,
  Square,
  Sun,
  Trash2,
  Undo2,
  X,
  Zap,
} from '@lucide/vue'
import InviteModal from './InviteModal.vue'
import {
  buildTruthTable,
  GATE_TYPES,
  inputCount,
  makeDemoCircuit,
  MAX_TRUTH_TABLE_INPUTS,
  MAX_GATE_INPUTS,
  NODE_HEIGHT,
  NODE_WIDTH,
  evaluateCircuit,
} from './logic.js'

const STORAGE_KEY = 'logic-lab.workspace.v1'
const TOUR_STORAGE_KEY = 'logic-lab.onboarding.v1'
const ALLOWED_TYPES = new Set(['INPUT', 'VCC', 'GND', 'LED', ...GATE_TYPES])
const DEFAULT_DEMO = makeDemoCircuit()

const strings = {
  en: {
    studio: 'CIRCUIT STUDIO',
    project: 'PROJECT',
    saved: 'Saved locally',
    saving: 'Saving…',
    saveError: 'Save failed',
    newCircuit: 'New circuit',
    exportProject: 'Export project',
    language: 'Switch language',
    showComponents: 'Show component library',
    hideComponents: 'Collapse component library',
    showInspector: 'Show inspector',
    hideInspector: 'Collapse inspector',
    themeLight: 'Switch to light mode',
    themeDark: 'Switch to dark mode',
    running: 'Simulation running',
    stopped: 'Simulation paused',
    simulate: 'Run simulation',
    pause: 'Pause simulation',
    components: 'Components',
    search: 'Search components…',
    sources: 'Sources',
    logicGates: 'Logic gates',
    outputs: 'Outputs',
    inputSwitch: 'Input switch',
    inputHint: 'Interactive 0 / 1 source',
    vccHint: 'Constant logic HIGH',
    ground: 'Ground',
    groundHint: 'Constant logic LOW',
    ledOutput: 'LED output',
    ledHint: 'Circuit output indicator',
    canvas: 'Schematic canvas',
    selectTool: 'Select & move',
    wireTool: 'Connect wires',
    snap: 'Snap to grid',
    dropHint: 'Drag a component here, or click one in the library',
    canvasHint: 'Drag empty space to move the full circuit · click output then input to connect',
    zoomOut: 'Zoom out',
    zoomIn: 'Zoom in',
    properties: 'Properties',
    inspect: 'Inspector',
    nothingSelected: 'Nothing selected',
    selectHelp: 'Select a component on the canvas to inspect and edit it.',
    component: 'Component',
    name: 'Label',
    signal: 'Live signal',
    high: 'HIGH',
    low: 'LOW',
    inputPins: 'Inputs',
    gateInputCount: 'Number of inputs',
    addGateInput: 'Add an input pin',
    removeGateInput: 'Remove the last input pin',
    outputPin: 'Output',
    connected: 'Connected',
    unconnected: 'Not connected',
    duplicate: 'Duplicate',
    delete: 'Delete',
    circuitSummary: 'Circuit summary',
    componentsCount: 'Components',
    wiresCount: 'Wires',
    inputCountLabel: 'Inputs',
    outputCountLabel: 'Outputs',
    quickTips: 'Quick tips',
    tipDrag: 'Drag empty canvas space to move the full circuit, or drag a component to move it alone.',
    tipWire: 'Click a pin on the right, then a pin on the left to wire.',
    tipToggle: 'Click an input switch to toggle its logic state.',
    tipOutputs: 'Add LED components repeatedly to show multiple truth-table outputs.',
    openSource: 'OPEN SOURCE',
    openSourceCredit: 'Open-source project by Nour Yahyaoui — view it on GitHub',
    notHint: 'Inverter: output is the opposite of the input',
    by: 'Designed by',
    truthTable: 'Truth table',
    combinations: 'combinations',
    copyCsv: 'Copy CSV',
    showTruthTable: 'Show truth table',
    hideTruthTable: 'Collapse truth table',
    fullScreenTruth: 'Expand truth table fullscreen',
    exitFullScreenTruth: 'Exit fullscreen truth table',
    row: 'ROW',
    input: 'INPUT',
    output: 'OUTPUT',
    noOutputs: 'Add an LED output to see circuit results here.',
    noInputs: 'No input switches yet — constants make a single-row table.',
    tableLimit: 'Showing the first 8 inputs. Additional inputs use their current switch state.',
    helpTitle: 'Build a logic circuit',
    helpStep1Title: 'Place components',
    helpStep1: 'Click or drag a part onto the canvas. Drag empty space to move the full circuit; drag a part to move it alone.',
    helpStep2Title: 'Connect signals',
    helpStep2: 'Click a component output pin (right side), then a destination input pin (left side).',
    helpStep3Title: 'Test the logic',
    helpStep3: 'Toggle inputs, add VCC or GND, and add as many LED outputs as your circuit needs.',
    tourSkip: 'Skip tour',
    tourBegin: 'Start tour',
    tourNext: 'Continue',
    tourBack: 'Back',
    tourFinish: 'Finish tour',
    tourStep: 'STEP',
    tourQuick: 'A QUICK WALKTHROUGH',
    tourReady: 'READY WHEN YOU ARE',
    tourWelcomeTitle: 'Welcome to Logic Lab',
    tourWelcomeBody: 'Take a quick, guided look around the workspace. We’ll show you the component library, canvas tools, inspector and live truth table.',
    tourLibraryTitle: 'Your component library',
    tourLibraryBody: 'Open this panel to browse input switches, logic gates, VCC / GND and LED outputs.',
    tourPartsTitle: 'Find your components',
    tourPartsBody: 'This library contains input switches, logic gates, VCC / GND and LED outputs. After the tour, click a part or drag it onto the canvas.',
    tourCanvasTitle: 'Build and connect',
    tourCanvasBody: 'The canvas toolbar keeps Select, Wire, grid snap, panel toggles and zoom together. Drag empty canvas space to pan the full circuit.',
    tourInspectorTitle: 'Open the inspector',
    tourInspectorBody: 'Use this button to open properties for the selected component: its name, live signal, gate inputs and actions.',
    tourInspectorPanelTitle: 'Your properties panel',
    tourInspectorPanelBody: 'Details for the selected item appear here. Select a gate, switch or wire to see its available controls.',
    tourTruthTitle: 'Live truth table',
    tourTruthBody: 'The table updates as you build. Collapse or resize it, open it fullscreen, or copy the results as CSV.',
    tourActionsTitle: 'Workspace controls',
    tourActionsBody: 'Change the theme or language, control simulation, undo or redo, start a new circuit, and export your project from the top bar.',
    tourDoneTitle: 'You’re ready to build',
    tourDoneBody: 'Your workspace saves locally in this browser. You can replay this tour any time from Help.',
    tourReplay: 'Take the guided tour',
    keyboard: 'Keyboard shortcuts',
    shortcutDelete: 'Delete selected part or wire',
    shortcutUndo: 'Undo',
    shortcutRedo: 'Redo',
    close: 'Close',
    toastAdded: 'Component added',
    toastDuplicated: 'Component duplicated',
    toastDeleted: 'Selection deleted',
    toastWired: 'Wire connected',
    toastRemovedWire: 'Wire removed',
    toastCleared: 'New blank circuit created',
    toastSaved: 'Project saved in this browser',
    toastCopied: 'Truth table copied as CSV',
    toastExported: 'Project exported',
    toastMaxInputs: 'A circuit can have up to 8 input switches for a readable truth table.',
    confirmNew: 'Start a new blank circuit? You can undo this change during the current session.',
    simHint: 'Logic is evaluated live. Simulation highlights active signals.',
    startWire: 'Choose a destination input pin',
    selectOutput: 'Click an output pin to begin wiring',
    valueToggle: 'Toggle logic state',
    gateDescription: {
      AND: 'HIGH only when both inputs are HIGH.',
      OR: 'HIGH when at least one input is HIGH.',
      NOT: 'Inverts the input signal.',
      XOR: 'HIGH when the inputs are different.',
      NAND: 'Inverts the AND result.',
      NOR: 'Inverts the OR result.',
      XNOR: 'HIGH when the inputs match.',
    },
    portA: 'Input 1',
    portB: 'Input 2',
  },
  fr: {
    studio: 'STUDIO DE CIRCUITS',
    project: 'PROJET',
    saved: 'Enregistré localement',
    saving: 'Enregistrement…',
    saveError: 'Échec de sauvegarde',
    newCircuit: 'Nouveau circuit',
    exportProject: 'Exporter le projet',
    language: 'Changer de langue',
    showComponents: 'Afficher la bibliothèque',
    hideComponents: 'Masquer la bibliothèque',
    showInspector: 'Afficher l’inspecteur',
    hideInspector: 'Masquer l’inspecteur',
    themeLight: 'Passer en mode clair',
    themeDark: 'Passer en mode sombre',
    running: 'Simulation active',
    stopped: 'Simulation en pause',
    simulate: 'Lancer la simulation',
    pause: 'Mettre en pause',
    components: 'Composants',
    search: 'Rechercher un composant…',
    sources: 'Sources',
    logicGates: 'Portes logiques',
    outputs: 'Sorties',
    inputSwitch: 'Interrupteur d’entrée',
    inputHint: 'Source interactive 0 / 1',
    vccHint: 'Niveau logique HAUT constant',
    ground: 'Masse',
    groundHint: 'Niveau logique BAS constant',
    ledOutput: 'Sortie LED',
    ledHint: 'Indicateur de sortie du circuit',
    canvas: 'Zone de schéma',
    selectTool: 'Sélectionner et déplacer',
    wireTool: 'Connecter des fils',
    snap: 'Aligner sur la grille',
    dropHint: 'Glissez un composant ici ou cliquez dans la bibliothèque',
    canvasHint: 'Glissez un espace vide pour déplacer le circuit · cliquez sur les broches pour relier',
    zoomOut: 'Dézoomer',
    zoomIn: 'Zoomer',
    properties: 'Propriétés',
    inspect: 'Inspecteur',
    nothingSelected: 'Aucun élément sélectionné',
    selectHelp: 'Sélectionnez un composant pour afficher et modifier ses propriétés.',
    component: 'Composant',
    name: 'Nom',
    signal: 'Signal en direct',
    high: 'HAUT',
    low: 'BAS',
    inputPins: 'Entrées',
    gateInputCount: 'Nombre d’entrées',
    addGateInput: 'Ajouter une entrée',
    removeGateInput: 'Supprimer la dernière entrée',
    outputPin: 'Sortie',
    connected: 'Connectée',
    unconnected: 'Non connectée',
    duplicate: 'Dupliquer',
    delete: 'Supprimer',
    circuitSummary: 'Résumé du circuit',
    componentsCount: 'Composants',
    wiresCount: 'Fils',
    inputCountLabel: 'Entrées',
    outputCountLabel: 'Sorties',
    quickTips: 'Astuces',
    tipDrag: 'Glissez une zone vide pour déplacer tout le circuit, ou un composant pour le déplacer seul.',
    tipWire: 'Cliquez sur une sortie à droite, puis sur une entrée à gauche.',
    tipToggle: 'Cliquez sur un interrupteur pour changer son état logique.',
    tipOutputs: 'Ajoutez plusieurs LED pour afficher plusieurs sorties dans le tableau de vérité.',
    openSource: 'LOGICIEL LIBRE',
    openSourceCredit: 'Projet libre de Nour Yahyaoui — voir sur GitHub',
    notHint: 'Inverseur : la sortie est l’opposé de l’entrée',
    by: 'Créé par',
    truthTable: 'Tableau de vérité',
    combinations: 'combinaisons',
    copyCsv: 'Copier CSV',
    showTruthTable: 'Afficher le tableau de vérité',
    hideTruthTable: 'Masquer le tableau de vérité',
    fullScreenTruth: 'Afficher le tableau de vérité en plein écran',
    exitFullScreenTruth: 'Quitter le plein écran du tableau',
    row: 'LIGNE',
    input: 'ENTRÉE',
    output: 'SORTIE',
    noOutputs: 'Ajoutez une sortie LED pour afficher les résultats du circuit.',
    noInputs: 'Aucune entrée — les constantes produisent une seule ligne.',
    tableLimit: 'Seules les 8 premières entrées sont affichées. Les suivantes gardent leur état actuel.',
    helpTitle: 'Créer un circuit logique',
    helpStep1Title: 'Placer les composants',
    helpStep1: 'Cliquez sur un composant ou glissez-le sur la zone. Glissez un espace vide pour déplacer tout le circuit.',
    helpStep2Title: 'Relier les signaux',
    helpStep2: 'Cliquez sur une sortie (à droite), puis sur une entrée de destination (à gauche).',
    helpStep3Title: 'Tester la logique',
    helpStep3: 'Changez les entrées, ajoutez VCC ou GND et autant de sorties LED que nécessaire.',
    tourSkip: 'Ignorer la visite',
    tourBegin: 'Commencer la visite',
    tourNext: 'Continuer',
    tourBack: 'Retour',
    tourFinish: 'Terminer la visite',
    tourStep: 'ÉTAPE',
    tourQuick: 'VISITE GUIDÉE',
    tourReady: 'À VOUS DE JOUER',
    tourWelcomeTitle: 'Bienvenue dans Logic Lab',
    tourWelcomeBody: 'Découvrez rapidement l’espace de travail. Cette visite présente la bibliothèque, les outils du canevas, l’inspecteur et le tableau de vérité.',
    tourLibraryTitle: 'Votre bibliothèque de composants',
    tourLibraryBody: 'Ouvrez ce panneau pour parcourir les interrupteurs, portes logiques, VCC / GND et sorties LED.',
    tourPartsTitle: 'Trouver vos composants',
    tourPartsBody: 'Cette bibliothèque regroupe les interrupteurs, portes logiques, VCC / GND et sorties LED. Après la visite, cliquez sur un élément ou glissez-le sur le canevas.',
    tourCanvasTitle: 'Construire et relier',
    tourCanvasBody: 'La barre du canevas regroupe Sélection, Fils, l’alignement sur la grille, les panneaux et le zoom. Glissez un espace vide pour déplacer tout le circuit.',
    tourInspectorTitle: 'Ouvrir l’inspecteur',
    tourInspectorBody: 'Ce bouton ouvre les propriétés du composant sélectionné : nom, signal en direct, entrées de porte et actions.',
    tourInspectorPanelTitle: 'Le panneau des propriétés',
    tourInspectorPanelBody: 'Les détails de l’élément sélectionné apparaissent ici. Choisissez une porte, un interrupteur ou un fil pour voir ses commandes.',
    tourTruthTitle: 'Tableau de vérité en direct',
    tourTruthBody: 'Le tableau se met à jour pendant la construction. Réduisez-le, redimensionnez-le, affichez-le en plein écran ou copiez-le en CSV.',
    tourActionsTitle: 'Commandes de l’espace de travail',
    tourActionsBody: 'Changez le thème ou la langue, contrôlez la simulation, annulez/rétablissez, créez un circuit ou exportez-le depuis la barre supérieure.',
    tourDoneTitle: 'À vous de jouer',
    tourDoneBody: 'Votre espace de travail est enregistré dans ce navigateur. Vous pourrez relancer la visite à tout moment depuis Aide.',
    tourReplay: 'Lancer la visite guidée',
    keyboard: 'Raccourcis clavier',
    shortcutDelete: 'Supprimer l’élément ou le fil sélectionné',
    shortcutUndo: 'Annuler',
    shortcutRedo: 'Rétablir',
    close: 'Fermer',
    toastAdded: 'Composant ajouté',
    toastDuplicated: 'Composant dupliqué',
    toastDeleted: 'Sélection supprimée',
    toastWired: 'Fil connecté',
    toastRemovedWire: 'Fil supprimé',
    toastCleared: 'Nouveau circuit vide créé',
    toastSaved: 'Projet enregistré dans ce navigateur',
    toastCopied: 'Tableau copié au format CSV',
    toastExported: 'Projet exporté',
    toastMaxInputs: 'Un circuit peut contenir jusqu’à 8 interrupteurs pour garder un tableau lisible.',
    confirmNew: 'Créer un nouveau circuit vide ? Vous pourrez annuler cette action pendant la session actuelle.',
    simHint: 'La logique est calculée en direct. La simulation met en évidence les signaux actifs.',
    startWire: 'Choisissez une entrée de destination',
    selectOutput: 'Cliquez sur une sortie pour commencer le câblage',
    valueToggle: 'Changer l’état logique',
    gateDescription: {
      AND: 'HAUT uniquement si les deux entrées sont HAUTES.',
      OR: 'HAUT si au moins une entrée est HAUTE.',
      NOT: 'Inverse le signal d’entrée.',
      XOR: 'HAUT lorsque les entrées sont différentes.',
      NAND: 'Inverse le résultat de AND.',
      NOR: 'Inverse le résultat de OR.',
      XNOR: 'HAUT lorsque les entrées sont identiques.',
    },
    portA: 'Entrée 1',
    portB: 'Entrée 2',
  },
}

const language = ref('en')
const theme = ref('dark')
const leftCollapsed = ref(true)
const rightCollapsed = ref(true)
const truthCollapsed = ref(false)
const truthFullscreen = ref(false)
const nodes = ref(DEFAULT_DEMO.nodes.map((node) => ({ ...node })))
const wires = ref(DEFAULT_DEMO.wires.map((wire) => ({ ...wire })))
const projectName = ref(DEFAULT_DEMO.projectName)
const leftWidth = ref(260)
const rightWidth = ref(278)
const truthHeight = ref(232)
const snapToGrid = ref(true)
const zoom = ref(1)
const toolMode = ref('select')
const selectedNodeId = ref(null)
const selectedWireId = ref(null)
const wireStart = ref(null)
const dragging = ref(null)
const panOffset = ref({ x: 0, y: 0 })
const canvasPanDrag = ref(null)
const isPanning = ref(false)
const isRunning = ref(true)
const showHelp = ref(false)
const tourActive = ref(false)
const tourStep = ref(0)
const tourTargetRect = ref(null)
const tourCard = ref(null)
const tourViewport = ref({ width: 0, height: 0 })
const searchQuery = ref('')
const toastMessage = ref('')
const saveState = ref('saved')
const canvasSize = ref({ width: 960, height: 520 })
const canvasSvg = ref(null)
const canvasRegion = ref(null)
const paletteSearch = ref(null)
const isHydrated = ref(false)
const historyPast = ref([])
const historyFuture = ref([])
const resizeState = ref(null)
const mobilePanel = ref('')

let saveTimer = 0
let toastTimer = 0
let idCounter = 0
let resizeObserver

const t = (key) => strings[language.value]?.[key] ?? strings.en[key] ?? key
const isInviteRoute = computed(() => window.location.pathname.replace(/\/+$/, '') === '/invite')
const tourSteps = computed(() => [
  { id: 'welcome', title: t('tourWelcomeTitle'), body: t('tourWelcomeBody') },
  { id: 'library-toggle', target: '[data-tour="sidebar-left-toggle"]', mobileTarget: '[data-tour="mobile-sidebar-left"]', interactive: true, title: t('tourLibraryTitle'), body: t('tourLibraryBody') },
  { id: 'library-content', target: '[data-tour="tour-input-card"]', title: t('tourPartsTitle'), body: t('tourPartsBody') },
  { id: 'canvas-tools', target: '[data-tour="canvas-tools"]', title: t('tourCanvasTitle'), body: t('tourCanvasBody') },
  { id: 'inspector-toggle', target: '[data-tour="sidebar-right-toggle"]', mobileTarget: '[data-tour="mobile-sidebar-right"]', interactive: true, title: t('tourInspectorTitle'), body: t('tourInspectorBody') },
  { id: 'inspector-content', target: '[data-tour="inspector-panel"]', title: t('tourInspectorPanelTitle'), body: t('tourInspectorPanelBody') },
  { id: 'truth-table', target: '[data-tour="truth-table"]', title: t('tourTruthTitle'), body: t('tourTruthBody') },
  { id: 'top-actions', target: '[data-tour="top-actions"]', title: t('tourActionsTitle'), body: t('tourActionsBody') },
  { id: 'finish', title: t('tourDoneTitle'), body: t('tourDoneBody') },
])
const currentTourStep = computed(() => tourSteps.value[tourStep.value] ?? null)
const tourLastStep = computed(() => tourSteps.value.length - 1)
const tourGuidedStepCount = computed(() => Math.max(1, tourSteps.value.length - 2))
const tourProgress = computed(() => tourStep.value <= 0 ? 0 : tourStep.value >= tourLastStep.value ? 100 : Math.round(tourStep.value / tourGuidedStepCount.value * 100))
const tourKicker = computed(() => tourStep.value === 0 ? t('tourQuick') : tourStep.value === tourLastStep.value ? t('tourReady') : `${t('tourStep')} ${tourStep.value} / ${tourGuidedStepCount.value}`)
const tourShadeStyles = computed(() => {
  const { width: viewportWidth, height: viewportHeight } = tourViewport.value
  if (!viewportWidth || !viewportHeight) return []
  const target = tourTargetRect.value
  if (!target) return [{ top: '0px', left: '0px', width: `${viewportWidth}px`, height: `${viewportHeight}px` }]
  const padding = 9
  const left = Math.max(0, target.left - padding)
  const top = Math.max(0, target.top - padding)
  const right = Math.min(viewportWidth, target.left + target.width + padding)
  const bottom = Math.min(viewportHeight, target.top + target.height + padding)
  return [
    { top: 0, left: 0, width: viewportWidth, height: top },
    { top, left: 0, width: left, height: bottom - top },
    { top, left: right, width: viewportWidth - right, height: bottom - top },
    { top: bottom, left: 0, width: viewportWidth, height: viewportHeight - bottom },
  ].filter((shade) => shade.width > 0 && shade.height > 0).map((shade) => Object.fromEntries(Object.entries(shade).map(([key, value]) => [key, `${value}px`])))
})
const tourFocusStyle = computed(() => {
  const rect = tourTargetRect.value
  if (!rect) return {}
  const padding = 7
  return {
    left: `${Math.max(0, rect.left - padding)}px`,
    top: `${Math.max(0, rect.top - padding)}px`,
    width: `${Math.min(tourViewport.value.width, rect.width + padding * 2)}px`,
    height: `${Math.min(tourViewport.value.height, rect.height + padding * 2)}px`,
  }
})
const tourGuardStyle = computed(() => {
  const rect = tourTargetRect.value
  if (!rect) return {}
  return { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` }
})
const tourPointerStyle = computed(() => {
  const rect = tourTargetRect.value
  const viewport = tourViewport.value
  if (!rect || !viewport.width || !viewport.height) return { opacity: 0 }
  const size = 32
  const left = Math.max(4, Math.min(viewport.width - size - 4, rect.left + rect.width - 4))
  const top = Math.max(4, Math.min(viewport.height - size - 4, rect.top + rect.height - 5))
  return { left: `${left}px`, top: `${top}px`, opacity: 1 }
})
const tourCardStyle = computed(() => {
  const { width: viewportWidth, height: viewportHeight } = tourViewport.value
  if (!viewportWidth || !viewportHeight) return {}
  const target = tourTargetRect.value
  if (!target) return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
  const cardWidth = Math.min(480, viewportWidth - 24)
  const cardHeight = Math.min(280, viewportHeight - 24)
  const left = Math.max(12, Math.min(viewportWidth - cardWidth - 12, target.left + target.width / 2 - cardWidth / 2))
  let top = target.top + target.height + 18
  if (top + cardHeight > viewportHeight - 12) top = target.top - cardHeight - 18
  if (top < 12) top = Math.max(12, (viewportHeight - cardHeight) / 2)
  return { left: `${left}px`, top: `${top}px` }
})
const selectedNode = computed(() => nodes.value.find((node) => node.id === selectedNodeId.value) ?? null)
const selectedWire = computed(() => wires.value.find((wire) => wire.id === selectedWireId.value) ?? null)
const liveValues = computed(() => evaluateCircuit(nodes.value, wires.value))
const truth = computed(() => buildTruthTable(nodes.value, wires.value))
const truthRows = computed(() => truth.value.rows)
const viewWidth = computed(() => Math.max(1, canvasSize.value.width / zoom.value))
const viewHeight = computed(() => Math.max(1, canvasSize.value.height / zoom.value))
const viewBox = computed(() => `${panOffset.value.x} ${panOffset.value.y} ${viewWidth.value} ${viewHeight.value}`)
const truthPanelStyle = computed(() => ({ height: truthCollapsed.value ? '42px' : truthFullscreen.value ? '100dvh' : `${truthHeight.value}px` }))
const zoomLabel = computed(() => `${Math.round(zoom.value * 100)}%`)
const workspaceComponentCount = computed(() => nodes.value.length)
const inputNodes = computed(() => nodes.value.filter((node) => node.type === 'INPUT'))
const outputNodes = computed(() => nodes.value.filter((node) => node.type === 'LED'))
const isSelectedOutputHigh = computed(() => selectedNode.value ? Boolean(liveValues.value[selectedNode.value.id]) : false)
const currentWireMessage = computed(() => wireStart.value ? t('startWire') : toolMode.value === 'wire' ? t('selectOutput') : '')
const liveSaveLabel = computed(() => saveState.value === 'saving' ? t('saving') : saveState.value === 'error' ? t('saveError') : t('saved'))

const componentCatalog = [
  { type: 'INPUT', group: 'sources', title: 'inputSwitch', hint: 'inputHint', badge: 'IN', tint: 'mint' },
  { type: 'VCC', group: 'sources', title: 'VCC', hint: 'vccHint', badge: 'V+', tint: 'amber' },
  { type: 'GND', group: 'sources', title: 'ground', hint: 'groundHint', badge: 'GND', tint: 'slate' },
  ...GATE_TYPES.map((type) => ({ type, group: 'gates', title: type, hint: type === 'NOT' ? 'notHint' : '', badge: type, tint: 'blue' })),
  { type: 'LED', group: 'outputs', title: 'ledOutput', hint: 'ledHint', badge: 'LED', tint: 'rose' },
]
const filteredComponents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return componentCatalog
  return componentCatalog.filter((component) => {
    const title = component.title === component.type ? component.type : t(component.title)
    return `${component.type} ${title} ${t(component.hint)}`.toLowerCase().includes(query)
  })
})
const sourcesCatalog = computed(() => filteredComponents.value.filter((component) => component.group === 'sources'))
const gatesCatalog = computed(() => filteredComponents.value.filter((component) => component.group === 'gates'))
const outputsCatalog = computed(() => filteredComponents.value.filter((component) => component.group === 'outputs'))

function componentTitle(type) {
  const item = componentCatalog.find((component) => component.type === type)
  if (!item) return type
  return item.title === type ? type : t(item.title)
}

function gateDescription(type) {
  return t('gateDescription')?.[type] ?? ''
}

function makeId(prefix = 'node') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`
}

function snapshot() {
  return {
    nodes: JSON.parse(JSON.stringify(nodes.value)),
    wires: JSON.parse(JSON.stringify(wires.value)),
  }
}

function recordHistory(previous = snapshot()) {
  if (historyPast.value.length >= 80) historyPast.value.shift()
  historyPast.value.push(previous)
  historyFuture.value = []
}

function applySnapshot(state) {
  nodes.value = JSON.parse(JSON.stringify(state.nodes))
  wires.value = JSON.parse(JSON.stringify(state.wires))
  selectedNodeId.value = null
  selectedWireId.value = null
  wireStart.value = null
}

function undo() {
  if (!historyPast.value.length) return
  historyFuture.value.push(snapshot())
  applySnapshot(historyPast.value.pop())
}

function redo() {
  if (!historyFuture.value.length) return
  historyPast.value.push(snapshot())
  applySnapshot(historyFuture.value.pop())
}

const canUndo = computed(() => historyPast.value.length > 0)
const canRedo = computed(() => historyFuture.value.length > 0)

function notify(message) {
  toastMessage.value = message
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastMessage.value = '' }, 2400)
}

function safeLabelFor(type) {
  if (type === 'INPUT') {
    const used = new Set(nodes.value.filter((node) => node.type === 'INPUT').map((node) => node.label))
    for (const letter of 'ABCDEFGH') if (!used.has(letter)) return letter
    return `IN${used.size + 1}`
  }
  if (type === 'VCC') return 'VCC'
  if (type === 'GND') return 'GND'
  if (type === 'LED') {
    const count = nodes.value.filter((node) => node.type === 'LED').length + 1
    return count === 1 ? 'OUT' : `OUT${count}`
  }
  return `${type}${nodes.value.filter((node) => node.type === type).length + 1}`
}

function snapCoordinate(value) {
  return snapToGrid.value ? Math.round(value / 24) * 24 : value
}

function clampNodePosition(x, y, node = null) {
  const height = node ? nodeHeight(node) : NODE_HEIGHT
  const minX = panOffset.value.x + 8
  const minY = panOffset.value.y + 8
  const maxX = Math.max(minX, panOffset.value.x + viewWidth.value - NODE_WIDTH - 20)
  const maxY = Math.max(minY, panOffset.value.y + viewHeight.value - height - 20)
  return {
    x: Math.max(minX, Math.min(maxX, snapCoordinate(x))),
    y: Math.max(minY, Math.min(maxY, snapCoordinate(y))),
  }
}

function nextSpawnPosition() {
  const x = panOffset.value.x + Math.max(30, viewWidth.value / 2 - NODE_WIDTH / 2) + (idCounter % 4) * 32
  const y = panOffset.value.y + Math.max(45, viewHeight.value / 2 - NODE_HEIGHT / 2) + (idCounter % 5) * 26
  return clampNodePosition(x, y)
}

function addNode(type, x, y) {
  if (!ALLOWED_TYPES.has(type)) return
  if (type === 'INPUT' && inputNodes.value.length >= MAX_TRUTH_TABLE_INPUTS) {
    notify(t('toastMaxInputs'))
    return
  }
  recordHistory()
  const position = Number.isFinite(x) && Number.isFinite(y) ? clampNodePosition(x, y) : nextSpawnPosition()
  const node = {
    id: makeId('node'),
    type,
    label: safeLabelFor(type),
    x: position.x,
    y: position.y,
    ...(type === 'INPUT' ? { value: false } : {}),
  }
  nodes.value.push(node)
  selectedNodeId.value = node.id
  selectedWireId.value = null
  toolMode.value = 'select'
  notify(t('toastAdded'))
}

function addCatalogComponent(component) {
  addNode(component.type)
}

function onPaletteDragStart(event, type) {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/x-logic-component', type)
  event.dataTransfer.setData('text/plain', type)
}

function pointFromEvent(event) {
  const svg = canvasSvg.value
  if (!svg) return { x: 0, y: 0 }
  const rect = svg.getBoundingClientRect()
  return {
    x: panOffset.value.x + ((event.clientX - rect.left) / Math.max(1, rect.width)) * viewWidth.value,
    y: panOffset.value.y + ((event.clientY - rect.top) / Math.max(1, rect.height)) * viewHeight.value,
  }
}

function handleCanvasDrop(event) {
  event.preventDefault()
  const type = event.dataTransfer?.getData('application/x-logic-component') || event.dataTransfer?.getData('text/plain')
  if (!ALLOWED_TYPES.has(type)) return
  const point = pointFromEvent(event)
  addNode(type, point.x - NODE_WIDTH / 2, point.y - NODE_HEIGHT / 2)
}

function handleNodePointerDown(event, node, captureTarget = canvasSvg.value, toggleOnRelease = false) {
  if (event.button !== 0) return
  event.stopPropagation()
  if (wireStart.value) {
    wireStart.value = null
    toolMode.value = 'select'
  }
  selectedNodeId.value = node.id
  selectedWireId.value = null
  const point = pointFromEvent(event)
  dragging.value = {
    id: node.id,
    offsetX: point.x - node.x,
    offsetY: point.y - node.y,
    before: snapshot(),
    moved: false,
    toggleOnRelease,
  }
  try { captureTarget?.setPointerCapture(event.pointerId) } catch { /* some browsers do not support pointer capture */ }
}

function beginCanvasPan(event) {
  const rect = canvasSvg.value?.getBoundingClientRect()
  if (!rect) return
  canvasPanDrag.value = {
    pointerId: event.pointerId,
    clientX: event.clientX,
    clientY: event.clientY,
    startX: panOffset.value.x,
    startY: panOffset.value.y,
    startViewWidth: viewWidth.value,
    startViewHeight: viewHeight.value,
    width: Math.max(1, rect.width),
    height: Math.max(1, rect.height),
    moved: false,
  }
  try { canvasSvg.value?.setPointerCapture(event.pointerId) } catch { /* some browsers do not support pointer capture */ }
}

function handleCanvasPointerDown(event) {
  if (event.button !== 0) return
  if (event.target.closest?.('.wire-hit')) return
  if (event.target.closest?.('.node-group')) return
  selectedNodeId.value = null
  selectedWireId.value = null
  if (wireStart.value) {
    wireStart.value = null
    toolMode.value = 'select'
    return
  }
  beginCanvasPan(event)
}

function handleCanvasPointerMove(event) {
  const pan = canvasPanDrag.value
  if (pan && pan.pointerId === event.pointerId) {
    const deltaX = event.clientX - pan.clientX
    const deltaY = event.clientY - pan.clientY
    if (!pan.moved && Math.hypot(deltaX, deltaY) >= 4) {
      pan.moved = true
      isPanning.value = true
    }
    if (pan.moved) {
      const maxPan = 50000
      panOffset.value = {
        x: Math.max(-maxPan, Math.min(maxPan, pan.startX - (deltaX / pan.width) * pan.startViewWidth)),
        y: Math.max(-maxPan, Math.min(maxPan, pan.startY - (deltaY / pan.height) * pan.startViewHeight)),
      }
    }
  }

  const point = pointFromEvent(event)
  if (dragging.value) {
    const node = nodes.value.find((item) => item.id === dragging.value.id)
    if (!node) return
    if (!dragging.value.moved) {
      dragging.value.moved = true
      recordHistory(dragging.value.before)
    }
    const position = clampNodePosition(point.x - dragging.value.offsetX, point.y - dragging.value.offsetY, node)
    node.x = position.x
    node.y = position.y
  }
  if (wireStart.value) wireStart.value = { ...wireStart.value, cursor: point }
}

function handleCanvasPointerUp(event) {
  const activeDrag = dragging.value
  if (event?.type === 'pointerup' && activeDrag?.toggleOnRelease && !activeDrag.moved) {
    const node = nodes.value.find((item) => item.id === activeDrag.id)
    if (node) toggleInput(node)
  }
  dragging.value = null
  canvasPanDrag.value = null
  isPanning.value = false
}

function beginWire(event, node) {
  event.stopPropagation()
  if (node.type === 'LED') return
  if (wireStart.value?.id === node.id) {
    wireStart.value = null
    toolMode.value = 'select'
    return
  }
  wireStart.value = { id: node.id, cursor: pointFromEvent(event) }
  selectedNodeId.value = node.id
  selectedWireId.value = null
  toolMode.value = 'wire'
}

function finishWire(event, node, port) {
  event.stopPropagation()
  if (!wireStart.value) return
  if (wireStart.value.id === node.id) {
    wireStart.value = null
    toolMode.value = 'select'
    return
  }
  const source = nodes.value.find((item) => item.id === wireStart.value.id)
  if (!source || node.type === 'INPUT' || node.type === 'VCC' || node.type === 'GND') {
    wireStart.value = null
    toolMode.value = 'select'
    return
  }
  const before = snapshot()
  const from = wireStart.value.id
  wires.value = wires.value.filter((wire) => !(wire.to === node.id && wire.toPort === port))
  const wire = { id: makeId('wire'), from, to: node.id, toPort: port }
  wires.value.push(wire)
  recordHistory(before)
  selectedWireId.value = wire.id
  selectedNodeId.value = null
  wireStart.value = null
  toolMode.value = 'select'
  notify(t('toastWired'))
}

function handleWirePointerDown(event, wire) {
  event.stopPropagation()
  selectedWireId.value = wire.id
  selectedNodeId.value = null
  wireStart.value = null
  toolMode.value = 'select'
}

function wirePath(wire) {
  const source = nodes.value.find((node) => node.id === wire.from)
  const target = nodes.value.find((node) => node.id === wire.to)
  if (!source || !target) return ''
  const start = outputPosition(source)
  const end = inputPosition(target, wire.toPort)
  const bend = Math.max(28, Math.min(74, (end.x - start.x) * 0.48))
  const midX = start.x + bend
  return `M ${start.x} ${start.y} H ${midX} V ${end.y} H ${end.x}`
}

function inputLocalY(node, port) {
  const count = inputCount(node)
  if (count <= 1) return 28
  if (count === 2) return port === 0 ? 15 : 41
  return 15 + port * 20
}

function outputLocalY(node) {
  if (node.type !== 'OR' && node.type !== 'NOR') return 28
  const count = inputCount(node)
  return (inputLocalY(node, 0) + inputLocalY(node, count - 1)) / 2
}

function nodeHeight(node) {
  if (node.type !== 'OR' && node.type !== 'NOR') return NODE_HEIGHT
  return Math.max(NODE_HEIGHT, inputLocalY(node, inputCount(node) - 1) + 37)
}

function nodeCaptionY(node) {
  return Math.max(74, nodeHeight(node) - 8)
}

function orGatePath(node) {
  const top = inputLocalY(node, 0) - 11
  const bottom = inputLocalY(node, inputCount(node) - 1) + 11
  const center = (top + bottom) / 2
  return `M19 ${top} Q34 ${center} 19 ${bottom} Q49 ${bottom - 1} 81 ${center} Q49 ${top + 1} 19 ${top} Z`
}

function inputPosition(node, port) {
  return { x: node.x + 8, y: node.y + inputLocalY(node, port) }
}

function outputPosition(node) {
  return { x: node.x + 106, y: node.y + outputLocalY(node) }
}

function inputPinShortLabel(index) {
  return String.fromCharCode(65 + index)
}

function inputPinName(index) {
  if (index === 0) return t('portA')
  if (index === 1) return t('portB')
  return language.value === 'fr' ? `Entrée ${index + 1}` : `Input ${index + 1}`
}

function previewWirePath() {
  if (!wireStart.value) return ''
  const source = nodes.value.find((node) => node.id === wireStart.value.id)
  if (!source) return ''
  const start = outputPosition(source)
  const end = wireStart.value.cursor ?? start
  const bend = Math.max(28, Math.min(74, (end.x - start.x) * 0.48))
  return `M ${start.x} ${start.y} H ${start.x + bend} V ${end.y} H ${end.x}`
}

function wireIsHigh(wire) {
  return Boolean(liveValues.value[wire.from])
}

function toggleInput(node, event) {
  event?.stopPropagation?.()
  const before = snapshot()
  recordHistory(before)
  node.value = !node.value
}

function renameSelected(event) {
  if (!selectedNode.value) return
  const label = String(event.target.value || '').trim().slice(0, 20)
  if (!label || label === selectedNode.value.label) {
    event.target.value = selectedNode.value.label
    return
  }
  recordHistory()
  selectedNode.value.label = label
}

function duplicateSelected() {
  if (!selectedNode.value) return
  if (selectedNode.value.type === 'INPUT' && inputNodes.value.length >= MAX_TRUTH_TABLE_INPUTS) {
    notify(t('toastMaxInputs'))
    return
  }
  const source = selectedNode.value
  recordHistory()
  const position = clampNodePosition(source.x + 30, source.y + 30, source)
  const clone = {
    ...source,
    id: makeId('node'),
    label: safeLabelFor(source.type),
    x: position.x,
    y: position.y,
    ...(source.type === 'INPUT' ? { value: false } : {}),
  }
  nodes.value.push(clone)
  selectedNodeId.value = clone.id
  selectedWireId.value = null
  notify(t('toastDuplicated'))
}

function deleteSelection() {
  if (selectedNode.value) {
    const id = selectedNode.value.id
    recordHistory()
    nodes.value = nodes.value.filter((node) => node.id !== id)
    wires.value = wires.value.filter((wire) => wire.from !== id && wire.to !== id)
    selectedNodeId.value = null
    selectedWireId.value = null
    wireStart.value = null
    notify(t('toastDeleted'))
    return
  }
  if (selectedWire.value) {
    recordHistory()
    wires.value = wires.value.filter((wire) => wire.id !== selectedWireId.value)
    selectedWireId.value = null
    notify(t('toastRemovedWire'))
  }
}

function deleteWireById(id) {
  if (!id) return
  recordHistory()
  wires.value = wires.value.filter((wire) => wire.id !== id)
  selectedWireId.value = null
  notify(t('toastRemovedWire'))
}

function startNewCircuit() {
  if (!window.confirm(t('confirmNew'))) return
  recordHistory()
  nodes.value = []
  wires.value = []
  projectName.value = language.value === 'fr' ? 'Nouveau circuit' : 'Untitled circuit'
  selectedNodeId.value = null
  selectedWireId.value = null
  wireStart.value = null
  toolMode.value = 'select'
  notify(t('toastCleared'))
}

function toggleLanguage() {
  language.value = language.value === 'en' ? 'fr' : 'en'
  document.documentElement.lang = language.value
}

function applyThemeToDocument() {
  document.documentElement.style.colorScheme = theme.value
  const themeMeta = document.querySelector('meta[name="theme-color"]')
  if (themeMeta) themeMeta.setAttribute('content', theme.value === 'light' ? '#f2f5f9' : '#080d16')
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  applyThemeToDocument()
}

function currentTourSelector(step = currentTourStep.value) {
  if (!step?.target) return ''
  return window.innerWidth <= 740 && step.mobileTarget ? step.mobileTarget : step.target
}

function updateTourTarget() {
  tourViewport.value = { width: window.innerWidth, height: window.innerHeight }
  if (!tourActive.value) return
  const selector = currentTourSelector()
  if (!selector) {
    tourTargetRect.value = null
    return
  }
  const target = document.querySelector(selector)
  if (!target) {
    tourTargetRect.value = null
    return
  }
  const rect = target.getBoundingClientRect()
  tourTargetRect.value = { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
}

function scheduleTourTargetUpdate(shouldFocus = false) {
  nextTick(() => {
    if (!tourActive.value) return
    if (shouldFocus) tourCard.value?.focus({ preventScroll: true })
    window.requestAnimationFrame(updateTourTarget)
  })
}

function moveTourTo(index) {
  tourStep.value = Math.max(0, Math.min(tourLastStep.value, index))
  if (!currentTourStep.value?.target) tourTargetRect.value = null
  scheduleTourTargetUpdate(true)
}

function startTour() {
  if (isInviteRoute.value) return
  showHelp.value = false
  leftCollapsed.value = true
  rightCollapsed.value = true
  truthFullscreen.value = false
  mobilePanel.value = ''
  tourStep.value = 0
  tourActive.value = true
  scheduleTourTargetUpdate(true)
}

function rememberTourDismissal() {
  try { window.localStorage.setItem(TOUR_STORAGE_KEY, 'done') } catch { /* tour can still be dismissed without storage */ }
}

function finishTour() {
  rememberTourDismissal()
  tourActive.value = false
  tourTargetRect.value = null
  leftCollapsed.value = true
  rightCollapsed.value = true
  mobilePanel.value = ''
  truthFullscreen.value = false
}

function skipTour() {
  finishTour()
}

function tourNext() {
  const id = currentTourStep.value?.id
  if (id === 'finish') {
    finishTour()
    return
  }
  if (id === 'library-toggle') {
    leftCollapsed.value = false
    if (window.innerWidth <= 740) mobilePanel.value = 'left'
  } else if (id === 'library-content') {
    leftCollapsed.value = true
    mobilePanel.value = ''
  } else if (id === 'inspector-toggle') {
    rightCollapsed.value = false
    if (window.innerWidth <= 740) mobilePanel.value = 'right'
  } else if (id === 'inspector-content') {
    rightCollapsed.value = true
    mobilePanel.value = ''
  }
  moveTourTo(tourStep.value + 1)
}

function tourPrevious() {
  if (tourStep.value <= 0) return
  const id = currentTourStep.value?.id
  if (id === 'library-content') {
    leftCollapsed.value = true
    mobilePanel.value = ''
  } else if (id === 'canvas-tools') {
    leftCollapsed.value = false
    if (window.innerWidth <= 740) mobilePanel.value = 'left'
  } else if (id === 'inspector-content') {
    rightCollapsed.value = true
    mobilePanel.value = ''
  } else if (id === 'truth-table') {
    rightCollapsed.value = false
    if (window.innerWidth <= 740) mobilePanel.value = 'right'
  }
  moveTourTo(tourStep.value - 1)
}

function handleTourSidebarClick(side) {
  const id = currentTourStep.value?.id
  if (side === 'left' && id === 'library-toggle') {
    leftCollapsed.value = false
    mobilePanel.value = ''
    moveTourTo(tourStep.value + 1)
    return true
  }
  if (side === 'left' && id === 'library-content') {
    leftCollapsed.value = true
    mobilePanel.value = ''
    moveTourTo(tourStep.value + 1)
    return true
  }
  if (side === 'right' && id === 'inspector-toggle') {
    rightCollapsed.value = false
    mobilePanel.value = ''
    moveTourTo(tourStep.value + 1)
    return true
  }
  if (side === 'right' && id === 'inspector-content') {
    rightCollapsed.value = true
    mobilePanel.value = ''
    moveTourTo(tourStep.value + 1)
    return true
  }
  return false
}

function handleTourMobilePanelClick(panel) {
  const id = currentTourStep.value?.id
  if (tourActive.value && panel === 'left' && id === 'library-toggle') {
    leftCollapsed.value = false
    mobilePanel.value = 'left'
    moveTourTo(tourStep.value + 1)
    return true
  }
  if (tourActive.value && panel === 'right' && id === 'inspector-toggle') {
    rightCollapsed.value = false
    mobilePanel.value = 'right'
    moveTourTo(tourStep.value + 1)
    return true
  }
  return false
}

function toggleSidebar(side) {
  if (tourActive.value && handleTourSidebarClick(side)) return
  if (side === 'left') leftCollapsed.value = !leftCollapsed.value
  if (side === 'right') rightCollapsed.value = !rightCollapsed.value
  mobilePanel.value = ''
}

function toggleTruthPanel() {
  if (truthFullscreen.value) truthFullscreen.value = false
  truthCollapsed.value = !truthCollapsed.value
  mobilePanel.value = ''
}

function toggleTruthFullscreen() {
  truthFullscreen.value = !truthFullscreen.value
  if (truthFullscreen.value) truthCollapsed.value = false
}

function toggleSimulation() {
  isRunning.value = !isRunning.value
}

function changeZoom(delta) {
  const centerX = panOffset.value.x + viewWidth.value / 2
  const centerY = panOffset.value.y + viewHeight.value / 2
  zoom.value = Math.max(0.65, Math.min(1.55, Math.round((zoom.value + delta) * 100) / 100))
  panOffset.value = {
    x: centerX - viewWidth.value / 2,
    y: centerY - viewHeight.value / 2,
  }
}

function sanitizeLoadedState(data) {
  if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.wires)) return null
  const seen = new Set()
  const validNodes = []
  for (const raw of data.nodes.slice(0, 500)) {
    if (!raw || !ALLOWED_TYPES.has(raw.type) || typeof raw.id !== 'string' || seen.has(raw.id)) continue
    seen.add(raw.id)
    validNodes.push({
      id: raw.id.slice(0, 100),
      type: raw.type,
      label: String(raw.label || raw.type).slice(0, 20),
      ...(['OR', 'NOR'].includes(raw.type) ? { inputCount: inputCount(raw) } : {}),
      x: Number.isFinite(Number(raw.x)) ? Math.max(-100000, Math.min(100000, Number(raw.x))) : 40,
      y: Number.isFinite(Number(raw.y)) ? Math.max(-100000, Math.min(100000, Number(raw.y))) : 40,
      ...(raw.type === 'INPUT' ? { value: Boolean(raw.value) } : {}),
    })
  }
  const validNodeMap = new Map(validNodes.map((node) => [node.id, node]))
  const wiredInputs = new Set()
  const validWires = []
  for (const raw of data.wires.slice(0, 1000)) {
    const from = validNodeMap.get(raw?.from)
    const to = validNodeMap.get(raw?.to)
    const port = Number(raw?.toPort)
    if (!from || !to || from.type === 'LED' || !Number.isInteger(port) || port < 0 || port >= inputCount(to)) continue
    const key = `${to.id}:${port}`
    if (wiredInputs.has(key)) continue
    wiredInputs.add(key)
    validWires.push({
      id: typeof raw.id === 'string' ? raw.id.slice(0, 100) : makeId('wire'),
      from: from.id,
      to: to.id,
      toPort: port,
    })
  }
  return {
    nodes: validNodes,
    wires: validWires,
    projectName: String(data.projectName || 'Untitled circuit').slice(0, 80),
    language: data.language === 'fr' ? 'fr' : 'en',
    theme: data.theme === 'light' ? 'light' : 'dark',
    leftCollapsed: Boolean(data.leftCollapsed),
    rightCollapsed: Boolean(data.rightCollapsed),
    truthCollapsed: Boolean(data.truthCollapsed),
    leftWidth: Number.isFinite(data.leftWidth) ? Math.max(210, Math.min(370, data.leftWidth)) : 260,
    rightWidth: Number.isFinite(data.rightWidth) ? Math.max(230, Math.min(400, data.rightWidth)) : 278,
    truthHeight: Number.isFinite(data.truthHeight) ? Math.max(145, Math.min(720, data.truthHeight)) : 232,
    snapToGrid: data.snapToGrid !== false,
    zoom: Number.isFinite(data.zoom) ? Math.max(0.65, Math.min(1.55, data.zoom)) : 1,
    panX: Number.isFinite(data.panX) ? Math.max(-50000, Math.min(50000, data.panX)) : 0,
    panY: Number.isFinite(data.panY) ? Math.max(-50000, Math.min(50000, data.panY)) : 0,
  }
}

function savePayload() {
  return {
    version: 1,
    nodes: nodes.value,
    wires: wires.value,
    projectName: projectName.value,
    language: language.value,
    theme: theme.value,
    leftCollapsed: leftCollapsed.value,
    rightCollapsed: rightCollapsed.value,
    truthCollapsed: truthCollapsed.value,
    leftWidth: leftWidth.value,
    rightWidth: rightWidth.value,
    truthHeight: truthHeight.value,
    snapToGrid: snapToGrid.value,
    zoom: zoom.value,
    panX: panOffset.value.x,
    panY: panOffset.value.y,
  }
}

const persistedSignature = computed(() => JSON.stringify(savePayload()))
watch(persistedSignature, () => {
  if (!isHydrated.value) return
  saveState.value = 'saving'
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, persistedSignature.value)
      saveState.value = 'saved'
    } catch (error) {
      console.error('Unable to save the circuit locally:', error)
      saveState.value = 'error'
    }
  }, 260)
})

function saveNow() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savePayload()))
    saveState.value = 'saved'
    notify(t('toastSaved'))
  } catch (error) {
    console.error('Unable to save the circuit locally:', error)
    saveState.value = 'error'
  }
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function exportProject() {
  const safeName = (projectName.value || 'logic-circuit').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'logic-circuit'
  downloadFile(`${safeName}.json`, JSON.stringify(savePayload(), null, 2), 'application/json')
  notify(t('toastExported'))
}

function csvCell(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

async function copyTruthTable() {
  const headers = [
    ...truth.value.inputs.map((node) => node.label),
    ...truth.value.outputs.map((node) => node.label),
  ]
  const lines = [headers.map(csvCell).join(',')]
  for (const row of truthRows.value) {
    lines.push([
      ...truth.value.inputs.map((node) => Number(row.inputs[node.id])),
      ...truth.value.outputs.map((node) => Number(row.outputs[node.id])),
    ].map(csvCell).join(','))
  }
  const csv = lines.join('\n')
  try {
    await navigator.clipboard.writeText(csv)
    notify(t('toastCopied'))
  } catch {
    downloadFile('truth-table.csv', csv, 'text/csv;charset=utf-8')
    notify(t('toastCopied'))
  }
}

function changeGateInputCount(node, delta) {
  if (!node || !['OR', 'NOR'].includes(node.type)) return
  const current = inputCount(node)
  const next = Math.max(2, Math.min(MAX_GATE_INPUTS, current + delta))
  if (next === current) return
  recordHistory()
  node.inputCount = next
  if (next < current) {
    wires.value = wires.value.filter((wire) => wire.to !== node.id || wire.toPort < next)
  }
  const position = clampNodePosition(node.x, node.y, node)
  node.x = position.x
  node.y = position.y
}

function inputConnection(node, port) {
  const wire = wires.value.find((item) => item.to === node.id && item.toPort === port)
  if (!wire) return null
  return nodes.value.find((item) => item.id === wire.from) ?? null
}

function gateOutputStart(type) {
  return ['NAND', 'NOR', 'XNOR', 'NOT'].includes(type) ? 92 : 82
}

function nodeDisplayValue(node) {
  return Boolean(liveValues.value[node.id])
}

function currentRowMatches(row) {
  return truth.value.inputs.every((node) => Boolean(row.inputs[node.id]) === Boolean(node.value))
}

function maxTruthHeight() {
  return Math.max(145, Math.min(720, Math.round(window.innerHeight * 0.7)))
}

function startResize(event, kind) {
  if (event.button !== 0) return
  event.preventDefault()
  resizeState.value = {
    kind,
    startX: event.clientX,
    startY: event.clientY,
    left: leftWidth.value,
    right: rightWidth.value,
    truth: truthHeight.value,
  }
  window.addEventListener('pointermove', handleResizeMove)
  window.addEventListener('pointerup', stopResize, { once: true })
  document.body.classList.add(kind === 'truth' ? 'is-resizing-row' : 'is-resizing-col')
}

function handleResizeMove(event) {
  if (!resizeState.value) return
  const { kind, startX, startY } = resizeState.value
  if (kind === 'left') leftWidth.value = Math.max(210, Math.min(370, resizeState.value.left + event.clientX - startX))
  if (kind === 'right') rightWidth.value = Math.max(230, Math.min(400, resizeState.value.right + startX - event.clientX))
  if (kind === 'truth') truthHeight.value = Math.max(145, Math.min(maxTruthHeight(), resizeState.value.truth + startY - event.clientY))
}

function stopResize() {
  window.removeEventListener('pointermove', handleResizeMove)
  document.body.classList.remove('is-resizing-row', 'is-resizing-col')
  resizeState.value = null
}

function resizeByKeyboard(event, kind) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
  event.preventDefault()
  const amount = event.shiftKey ? 24 : 8
  if (kind === 'left') leftWidth.value = Math.max(210, Math.min(370, leftWidth.value + (event.key === 'ArrowRight' ? amount : -amount)))
  if (kind === 'right') rightWidth.value = Math.max(230, Math.min(400, rightWidth.value + (event.key === 'ArrowLeft' ? amount : -amount)))
  if (kind === 'truth') truthHeight.value = Math.max(145, Math.min(maxTruthHeight(), truthHeight.value + (event.key === 'ArrowUp' ? amount : -amount)))
}

function onGlobalKeydown(event) {
  if (tourActive.value) {
    if (event.key === 'Escape') {
      event.preventDefault()
      skipTour()
    } else if (event.key === 'Tab') {
      const focusable = [...document.querySelectorAll('.tour-card button:not(:disabled)')]
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) {
        event.preventDefault()
      } else if (!tourCard.value?.contains(document.activeElement)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === tourCard.value)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === tourCard.value)) {
        event.preventDefault()
        first.focus()
      }
    }
    return
  }
  const targetTag = event.target?.tagName?.toLowerCase()
  const isEditing = ['input', 'textarea', 'select'].includes(targetTag) || event.target?.isContentEditable
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
    if (isEditing) return
    event.preventDefault()
    event.shiftKey ? redo() : undo()
    return
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') {
    if (isEditing) return
    event.preventDefault()
    redo()
    return
  }
  if (!isEditing && event.key === '/') {
    event.preventDefault()
    paletteSearch.value?.focus()
    return
  }
  if (event.key === 'Escape') {
    wireStart.value = null
    toolMode.value = 'select'
    truthFullscreen.value = false
    showHelp.value = false
    mobilePanel.value = ''
    return
  }
  if (!isEditing && (event.key === 'Delete' || event.key === 'Backspace')) {
    if (selectedNode.value || selectedWire.value) {
      event.preventDefault()
      deleteSelection()
    }
  }
}

function restoreFromStorage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return false
    const parsed = sanitizeLoadedState(JSON.parse(stored))
    if (!parsed) return false
    nodes.value = parsed.nodes
    wires.value = parsed.wires
    projectName.value = parsed.projectName
    language.value = parsed.language
    theme.value = parsed.theme
    leftCollapsed.value = parsed.leftCollapsed
    rightCollapsed.value = parsed.rightCollapsed
    truthCollapsed.value = parsed.truthCollapsed
    leftWidth.value = parsed.leftWidth
    rightWidth.value = parsed.rightWidth
    truthHeight.value = parsed.truthHeight
    snapToGrid.value = parsed.snapToGrid
    zoom.value = parsed.zoom
    panOffset.value = { x: parsed.panX, y: parsed.panY }
    return true
  } catch (error) {
    console.warn('Saved circuit could not be restored:', error)
    try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* private browsing can block storage */ }
    return false
  }
}

function fitDemoToCanvas() {
  zoom.value = Math.max(0.65, Math.min(1, canvasSize.value.width / 600))
  const width = viewWidth.value
  const height = viewHeight.value
  const left = Math.max(26, Math.round(width * 0.1))
  const available = Math.max(220, width - left - NODE_WIDTH - 18)
  const spacing = Math.min(220, Math.max(110, available / 2))
  let gateX = left + spacing
  let ledX = gateX + spacing
  if (ledX + NODE_WIDTH > width - 8) {
    const compactSpacing = Math.max(108, (width - left - NODE_WIDTH - 12) / 2)
    gateX = left + compactSpacing
    ledX = gateX + compactSpacing
  }
  const maxY = Math.max(10, height - NODE_HEIGHT - 12)
  const inputAY = Math.min(maxY, Math.max(16, height * 0.22))
  const inputBY = Math.min(maxY, Math.max(inputAY + 70, height * 0.62))
  const gateY = (inputAY + inputBY) / 2
  const positions = {
    'input-a': { x: left, y: inputAY },
    'input-b': { x: left, y: inputBY },
    'gate-xor': { x: gateX, y: gateY },
    'led-out': { x: ledX, y: gateY },
  }
  nodes.value = nodes.value.map((node) => ({ ...node, ...positions[node.id] }))
}

function updateCanvasSize() {
  if (!canvasRegion.value) return
  const rect = canvasRegion.value.getBoundingClientRect()
  canvasSize.value = { width: Math.max(1, rect.width), height: Math.max(1, rect.height) }
}

function openMobilePanel(panel) {
  if (handleTourMobilePanelClick(panel)) return
  const closing = mobilePanel.value === panel
  if (!closing && panel === 'left') leftCollapsed.value = false
  if (!closing && panel === 'right') rightCollapsed.value = false
  mobilePanel.value = closing ? '' : panel
}

function handleWindowResize() {
  updateCanvasSize()
  if (tourActive.value) scheduleTourTargetUpdate()
}

onMounted(async () => {
  let shouldStartTour = false
  try { shouldStartTour = !window.localStorage.getItem(TOUR_STORAGE_KEY) } catch { shouldStartTour = true }
  const restored = restoreFromStorage()
  if (shouldStartTour && !isInviteRoute.value) {
    leftCollapsed.value = true
    rightCollapsed.value = true
  }
  document.documentElement.lang = language.value
  applyThemeToDocument()
  await nextTick()
  updateCanvasSize()
  if (!restored) fitDemoToCanvas()
  if (typeof ResizeObserver !== 'undefined' && canvasRegion.value) {
    resizeObserver = new ResizeObserver(updateCanvasSize)
    resizeObserver.observe(canvasRegion.value)
  }
  isHydrated.value = true
  window.addEventListener('keydown', onGlobalKeydown)
  window.addEventListener('resize', handleWindowResize)
  window.addEventListener('scroll', scheduleTourTargetUpdate, true)
  if (shouldStartTour && !isInviteRoute.value) startTour()
})

onBeforeUnmount(() => {
  window.clearTimeout(saveTimer)
  window.clearTimeout(toastTimer)
  resizeObserver?.disconnect()
  window.removeEventListener('keydown', onGlobalKeydown)
  window.removeEventListener('resize', handleWindowResize)
  window.removeEventListener('scroll', scheduleTourTargetUpdate, true)
  window.removeEventListener('pointermove', handleResizeMove)
  window.removeEventListener('pointerup', stopResize)
})
</script>

<template>
  <div class="app-shell" :class="[`lang-${language}`, { 'wire-mode': wireStart || toolMode === 'wire', 'theme-light': theme === 'light' }]">
    <header class="topbar">
      <button class="mobile-panel-toggle" data-tour="mobile-sidebar-left" :aria-label="t('components')" @click="openMobilePanel('left')">
        <CircuitBoard :size="17" />
      </button>
      <div class="brand-block">
        <div class="brand-mark"><CircuitBoard :size="21" :stroke-width="1.8" /></div>
        <div class="brand-copy">
          <div class="brand-name">LOGIC<span>LAB</span></div>
          <div class="brand-subtitle">{{ t('studio') }}</div>
        </div>
      </div>

      <div class="header-divider"></div>
      <div class="project-block">
        <div class="eyebrow">{{ t('project') }}</div>
        <input v-model="projectName" class="project-name-input" maxlength="80" aria-label="Project name" />
      </div>
      <button class="save-indicator" :class="`save-${saveState}`" :title="t('saved')" :aria-label="t('saved')" @click="saveNow">
        <span class="save-dot"><Check v-if="saveState === 'saved'" :size="10" /></span>
        <span class="save-label">{{ liveSaveLabel }}</span>
      </button>

      <div class="top-actions" data-tour="top-actions">
        <div class="history-actions">
          <button class="icon-button" :disabled="!canUndo" :title="`${t('shortcutUndo')} · Ctrl Z`" :aria-label="t('shortcutUndo')" @click="undo">
            <Undo2 :size="16" />
          </button>
          <button class="icon-button" :disabled="!canRedo" :title="`${t('shortcutRedo')} · Ctrl Shift Z`" :aria-label="t('shortcutRedo')" @click="redo">
            <Redo2 :size="16" />
          </button>
        </div>
        <div class="top-separator"></div>
        <button class="top-text-button new-project-button" :title="t('newCircuit')" @click="startNewCircuit">
          <FilePlus2 :size="15" /><span>{{ t('newCircuit') }}</span>
        </button>
        <button class="icon-button export-button" :title="t('exportProject')" :aria-label="t('exportProject')" @click="exportProject">
          <Download :size="16" />
        </button>
        <a class="github-project-link" href="https://github.com/Nour-yahyaoui/multisim-pro" target="_blank" rel="noreferrer" :title="t('openSourceCredit')" :aria-label="t('openSourceCredit')">
          <GitBranch :size="15" />
          <span class="github-project-copy"><strong>GitHub</strong><small>{{ language === 'fr' ? 'Logiciel libre · par Nour Yahyaoui' : 'Open source · by Nour Yahyaoui' }}</small></span>
          <ExternalLink :size="11" />
        </a>
        <button class="theme-button" :title="t(theme === 'dark' ? 'themeLight' : 'themeDark')" :aria-label="t(theme === 'dark' ? 'themeLight' : 'themeDark')" @click="toggleTheme">
          <Sun v-if="theme === 'dark'" :size="15" /><Moon v-else :size="15" /><span>{{ theme === 'dark' ? (language === 'fr' ? 'Clair' : 'Light') : (language === 'fr' ? 'Sombre' : 'Dark') }}</span>
        </button>
        <button class="language-button" :title="t('language')" @click="toggleLanguage">
          <Globe2 :size="15" /><span>{{ language === 'en' ? 'EN' : 'FR' }}</span><ChevronRight :size="12" class="language-chevron" />
        </button>
        <button class="run-button" :class="{ paused: !isRunning }" :title="t(isRunning ? 'pause' : 'simulate')" @click="toggleSimulation">
          <Square v-if="isRunning" :size="12" fill="currentColor" /><Play v-else :size="13" fill="currentColor" />
          <span>{{ t(isRunning ? 'running' : 'simulate') }}</span>
          <span class="run-indicator"></span>
        </button>
        <button class="mobile-panel-toggle inspector-toggle" data-tour="mobile-sidebar-right" :aria-label="t('properties')" @click="openMobilePanel('right')">
          <Settings2 :size="17" />
        </button>
      </div>
    </header>

    <div class="main-layout">
      <button
        v-if="mobilePanel"
        type="button"
        class="mobile-scrim absolute inset-0 z-[15] border-0 bg-slate-950/45 backdrop-blur-[1px] min-[741px]:hidden"
        :aria-label="t('close')"
        @click="mobilePanel = ''"
      ></button>
      <aside v-if="!leftCollapsed" class="palette-panel" :class="{ 'mobile-open': mobilePanel === 'left' }" :style="{ width: `${leftWidth}px` }">
        <div class="panel-heading palette-heading">
          <div>
            <div class="panel-title">{{ t('components') }}</div>
            <div class="panel-subtitle">{{ componentCatalog.length }} {{ language === 'fr' ? 'éléments' : 'parts' }} <span class="heading-dot"></span> {{ language === 'fr' ? 'glisser-déposer' : 'drag & drop' }}</div>
          </div>
          <div class="panel-heading-actions">
            <button class="small-icon-button panel-collapse-button" :title="t('hideComponents')" :aria-label="t('hideComponents')" @click="toggleSidebar('left')"><PanelLeftClose :size="15" /></button>
            <button class="small-icon-button mobile-close" :aria-label="t('close')" @click="mobilePanel = ''"><X :size="15" /></button>
          </div>
        </div>
        <label class="search-field">
          <Search :size="15" />
          <input ref="paletteSearch" v-model="searchQuery" type="search" :placeholder="t('search')" />
          <kbd>/</kbd>
        </label>
        <div class="palette-scroll">
          <section v-if="sourcesCatalog.length" class="catalog-section">
            <div class="section-heading"><span>{{ t('sources') }}</span><span class="section-rule"></span></div>
            <div class="component-list source-list">
              <button
                v-for="component in sourcesCatalog"
                :key="component.type"
                class="component-card"
                :data-tour="component.type === 'INPUT' ? 'tour-input-card' : undefined"
                :class="`tone-${component.tint}`"
                draggable="true"
                :title="`${component.type} · ${t(component.hint)}`"
                @click="addCatalogComponent(component)"
                @dragstart="onPaletteDragStart($event, component.type)"
              >
                <span class="component-badge" :class="`badge-${component.tint}`">{{ component.badge }}</span>
                <span class="component-card-copy"><span class="component-card-title">{{ componentTitle(component.type) }}</span><span class="component-card-hint">{{ t(component.hint) }}</span></span>
                <Plus :size="13" class="component-add-icon" />
              </button>
            </div>
          </section>
          <section v-if="gatesCatalog.length" class="catalog-section">
            <div class="section-heading"><span>{{ t('logicGates') }}</span><span class="section-rule"></span><span class="section-count">{{ gatesCatalog.length }}</span></div>
            <div class="gate-grid">
              <button
                v-for="component in gatesCatalog"
                :key="component.type"
                class="gate-card"
                draggable="true"
                :title="component.type === 'NOT' ? `NOT · ${t(component.hint)}` : `${component.type} gate · ${language === 'fr' ? 'cliquer ou glisser' : 'click or drag to add'}`"
                @click="addCatalogComponent(component)"
                @dragstart="onPaletteDragStart($event, component.type)"
              >
                <span class="gate-mini-symbol" :class="{ inverted: ['NAND', 'NOR', 'XNOR', 'NOT'].includes(component.type) }">
                  <span>{{ component.type === 'NOT' ? '¬' : component.type === 'NAND' ? '&' : component.type === 'NOR' ? '≥1' : component.type === 'XNOR' ? '=1' : component.type === 'XOR' ? '=1' : component.type === 'OR' ? '≥1' : '&' }}</span>
                </span>
                <span class="gate-card-copy"><span class="gate-card-label">{{ component.type }}</span><small v-if="component.type === 'NOT'" class="not-gate-hint">{{ language === 'fr' ? 'INVERSEUR' : 'INVERTER' }}</small></span>
                <Plus :size="12" class="gate-add-icon" />
              </button>
            </div>
          </section>
          <section v-if="outputsCatalog.length" class="catalog-section">
            <div class="section-heading"><span>{{ t('outputs') }}</span><span class="section-rule"></span></div>
            <div class="component-list">
              <button
                v-for="component in outputsCatalog"
                :key="component.type"
                class="component-card"
                :class="`tone-${component.tint}`"
                draggable="true"
                :title="`${component.type} · ${t(component.hint)}`"
                @click="addCatalogComponent(component)"
                @dragstart="onPaletteDragStart($event, component.type)"
              >
                <span class="component-badge" :class="`badge-${component.tint}`"><Lightbulb :size="15" /></span>
                <span class="component-card-copy"><span class="component-card-title">{{ componentTitle(component.type) }}</span><span class="component-card-hint">{{ t(component.hint) }}</span></span>
                <Plus :size="13" class="component-add-icon" />
              </button>
            </div>
          </section>
          <div v-if="!filteredComponents.length" class="no-search-results">
            <Search :size="18" /><span>{{ language === 'fr' ? 'Aucun composant trouvé' : 'No components found' }}</span>
          </div>
          <div class="palette-tip">
            <div class="tip-icon"><Zap :size="14" /></div>
            <div><strong>{{ language === 'fr' ? 'Astuce' : 'Quick tip' }}</strong><p>{{ language === 'fr' ? 'Cliquez pour ajouter. Glissez sur la zone pour placer précisément.' : 'Click to add. Drag onto the canvas for precise placement.' }}</p></div>
          </div>
        </div>
        <div class="palette-footer">
          <a class="palette-credit-link" href="https://github.com/Nour-yahyaoui/multisim-pro" target="_blank" rel="noreferrer" :title="t('openSourceCredit')">
            <span class="footer-mini-mark"><CircuitBoard :size="13" /></span><span>{{ language === 'fr' ? 'Par Nour Yahyaoui' : 'By Nour Yahyaoui' }}</span><ExternalLink :size="10" />
          </a>
          <span class="footer-version">v2.0.3</span>
        </div>
      </aside>

      <div v-if="!leftCollapsed" class="vertical-resizer left-resizer" role="separator" aria-orientation="vertical" :aria-label="language === 'fr' ? 'Redimensionner la bibliothèque' : 'Resize component library'" tabindex="0" @pointerdown="startResize($event, 'left')" @keydown="resizeByKeyboard($event, 'left')"><span></span></div>

      <main class="workbench">
        <div class="canvas-toolbar" data-tour="canvas-tools">
          <div class="canvas-toolbar-title">
            <span class="canvas-live-dot"></span>
            <span>{{ t('canvas') }}</span>
            <ChevronRight :size="13" />
            <span class="canvas-project-name">{{ projectName || (language === 'fr' ? 'Sans titre' : 'Untitled') }}</span>
          </div>
          <div class="tool-group">
            <button class="tool-button" :class="{ active: toolMode !== 'wire' }" :title="t('selectTool')" :aria-label="t('selectTool')" @click="toolMode = 'select'; wireStart = null">
              <MousePointer2 :size="15" />
            </button>
            <button class="tool-button" :class="{ active: toolMode === 'wire' }" :title="t('wireTool')" :aria-label="t('wireTool')" @click="toolMode = 'wire'; wireStart = null">
              <Cable :size="15" />
            </button>
            <span class="tool-separator"></span>
            <button class="tool-button snap-button" :class="{ active: snapToGrid }" :title="t('snap')" :aria-label="t('snap')" @click="snapToGrid = !snapToGrid"><span class="snap-glyph">⌗</span></button>
          </div>
          <div class="layout-toggle-group">
            <button class="layout-toggle-button" data-tour="sidebar-left-toggle" :class="{ active: !leftCollapsed }" :title="t(leftCollapsed ? 'showComponents' : 'hideComponents')" :aria-label="t(leftCollapsed ? 'showComponents' : 'hideComponents')" :aria-expanded="!leftCollapsed" @click="toggleSidebar('left')">
              <PanelLeftOpen v-if="leftCollapsed" :size="15" /><PanelLeftClose v-else :size="15" />
            </button>
            <button class="layout-toggle-button" data-tour="sidebar-right-toggle" :class="{ active: !rightCollapsed }" :title="t(rightCollapsed ? 'showInspector' : 'hideInspector')" :aria-label="t(rightCollapsed ? 'showInspector' : 'hideInspector')" :aria-expanded="!rightCollapsed" @click="toggleSidebar('right')">
              <PanelRightOpen v-if="rightCollapsed" :size="15" /><PanelRightClose v-else :size="15" />
            </button>
            <button class="layout-toggle-button bottom-toggle" :class="{ active: !truthCollapsed }" :title="t(truthCollapsed ? 'showTruthTable' : 'hideTruthTable')" :aria-label="t(truthCollapsed ? 'showTruthTable' : 'hideTruthTable')" :aria-expanded="!truthCollapsed" @click="toggleTruthPanel">
              <PanelBottomOpen v-if="truthCollapsed" :size="15" /><PanelBottomClose v-else :size="15" />
            </button>
          </div>
          <div class="zoom-controls">
            <button class="zoom-button" :title="t('zoomOut')" :aria-label="t('zoomOut')" :disabled="zoom <= 0.65" @click="changeZoom(-0.1)"><Minus :size="13" /></button>
            <span class="zoom-value">{{ zoomLabel }}</span>
            <button class="zoom-button" :title="t('zoomIn')" :aria-label="t('zoomIn')" :disabled="zoom >= 1.55" @click="changeZoom(0.1)"><Plus :size="13" /></button>
            <button class="help-button" :title="t('helpTitle')" :aria-label="t('helpTitle')" @click="showHelp = true"><CircleHelp :size="16" /></button>
          </div>
        </div>

        <div ref="canvasRegion" class="canvas-region" :class="{ 'is-dragging-part': dragging, 'is-panning': isPanning, 'is-wiring': wireStart }">
          <svg
            ref="canvasSvg"
            class="schematic-canvas"
            :viewBox="viewBox"
            preserveAspectRatio="none"
            @pointerdown="handleCanvasPointerDown"
            @pointermove="handleCanvasPointerMove"
            @pointerup="handleCanvasPointerUp"
            @pointercancel="handleCanvasPointerUp"
            @dragover.prevent="($event.dataTransfer.dropEffect = 'copy')"
            @drop="handleCanvasDrop"
          >
            <defs>
              <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#25344a" />
              </pattern>
              <filter id="signal-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect :x="panOffset.x" :y="panOffset.y" :width="viewWidth" :height="viewHeight" class="canvas-base" />
            <rect :x="panOffset.x" :y="panOffset.y" :width="viewWidth" :height="viewHeight" fill="url(#dot-grid)" class="grid-dots" />
            <g class="wire-layer">
              <g v-for="wire in wires" :key="wire.id" class="wire-group">
                <path :d="wirePath(wire)" class="wire-path-under" />
                <path
                  :d="wirePath(wire)"
                  class="wire-path"
                  :class="{ active: isRunning && wireIsHigh(wire), selected: selectedWireId === wire.id }"
                />
                <path :d="wirePath(wire)" class="wire-hit" @pointerdown="handleWirePointerDown($event, wire)" />
                <circle v-if="wire.toPort >= 0" :cx="inputPosition(nodes.find((node) => node.id === wire.to), wire.toPort).x" :cy="inputPosition(nodes.find((node) => node.id === wire.to), wire.toPort).y" r="2.3" class="wire-endpoint" :class="{ active: isRunning && wireIsHigh(wire) }" />
              </g>
              <path v-if="wireStart" :d="previewWirePath()" class="wire-preview" />
            </g>

            <g
              v-for="node in nodes"
              :key="node.id"
              class="node-group"
              :class="[`node-${node.type.toLowerCase()}`, { selected: selectedNodeId === node.id, 'node-hot': isRunning && nodeDisplayValue(node) }]"
              :transform="`translate(${node.x} ${node.y})`"
              @pointerdown="handleNodePointerDown($event, node)"
            >
              <rect v-if="selectedNodeId === node.id" x="-7" y="-7" :width="NODE_WIDTH + 14" :height="nodeHeight(node) + 14" rx="12" class="selection-outline" />

              <template v-if="GATE_TYPES.includes(node.type)">
                <line v-for="port in inputCount(node)" :key="`input-stem-${port}`" x1="8" :y1="inputLocalY(node, port - 1)" x2="19" :y2="inputLocalY(node, port - 1)" class="pin-stem" />
                <line :x1="gateOutputStart(node.type)" :y1="outputLocalY(node)" x2="106" :y2="outputLocalY(node)" class="pin-stem" />
                <path v-if="node.type === 'AND' || node.type === 'NAND'" d="M19 4 H51 A24 24 0 0 1 51 52 H19 Z" class="gate-body" />
                <path v-else-if="node.type === 'OR' || node.type === 'NOR'" :d="orGatePath(node)" class="gate-body" />
                <g v-else-if="node.type === 'XOR' || node.type === 'XNOR'">
                  <path d="M12 4 Q27 28 12 52" class="gate-extra-curve" />
                  <path d="M19 4 Q34 28 19 52 Q49 51 81 28 Q49 5 19 4 Z" class="gate-body" />
                </g>
                <path v-else d="M20 4 L74 28 L20 52 Z" class="gate-body" />
                <circle v-if="['NAND', 'NOR', 'XNOR', 'NOT'].includes(node.type)" cx="86" :cy="outputLocalY(node)" r="4.5" class="inversion-bubble" />
                <text v-if="node.type !== 'NOT'" x="48" :y="outputLocalY(node) + 3" class="gate-inner-label">{{ node.type === 'NAND' ? 'AND' : node.type === 'NOR' ? 'OR' : node.type === 'XNOR' ? 'XOR' : node.type }}</text>
                <circle v-for="port in inputCount(node)" :key="`input-port-${port}`" cx="8" :cy="inputLocalY(node, port - 1)" r="4" class="input-port" :class="{ 'port-ready': wireStart }" :aria-label="inputPinName(port - 1)" @pointerdown.stop.prevent="finishWire($event, node, port - 1)" />
              </template>

              <template v-else-if="node.type === 'INPUT'">
                <g class="input-switch-control" :class="{ on: node.value }" :aria-label="t('valueToggle')" @pointerdown.stop="handleNodePointerDown($event, node, $event.currentTarget, true)">
                  <rect x="17" y="7" width="66" height="42" rx="10" class="source-shell" />
                  <rect x="27" y="17" width="46" height="18" rx="9" class="switch-track" />
                  <circle :cx="node.value ? 62 : 38" cy="26" r="7" class="switch-thumb" />
                  <text x="50" y="44" class="switch-state">{{ node.value ? '1' : '0' }}</text>
                </g>
              </template>

              <template v-else-if="node.type === 'VCC'">
                <path d="M52 8 V22 M34 35 L52 10 L70 35 Z" class="supply-symbol" />
                <line x1="70" y1="28" x2="106" y2="28" class="pin-stem" />
                <text x="52" y="47" class="supply-caption">+5V</text>
              </template>

              <template v-else-if="node.type === 'GND'">
                <line x1="52" y1="7" x2="52" y2="27" class="supply-symbol" />
                <line x1="33" y1="28" x2="71" y2="28" class="supply-symbol" />
                <line x1="39" y1="36" x2="65" y2="36" class="supply-symbol" />
                <line x1="45" y1="44" x2="59" y2="44" class="supply-symbol" />
                <line x1="71" y1="28" x2="106" y2="28" class="pin-stem" />
              </template>

              <template v-else-if="node.type === 'LED'">
                <line x1="8" y1="28" x2="29" y2="28" class="pin-stem" />
                <circle cx="51" cy="28" r="18" class="led-ring" :class="{ lit: isRunning && nodeDisplayValue(node) }" />
                <path d="M43 24 L51 18 L59 24 M43 32 L51 26 L59 32" class="led-filament" :class="{ lit: isRunning && nodeDisplayValue(node) }" />
                <path d="M67 11 L74 5 M69 19 L78 16" class="led-rays" :class="{ lit: isRunning && nodeDisplayValue(node) }" />
                <circle cx="8" cy="28" r="4" class="input-port" :class="{ 'port-ready': wireStart }" :aria-label="t('portA')" @pointerdown.stop.prevent="finishWire($event, node, 0)" />
              </template>

              <template v-if="node.type !== 'INPUT'">
                <circle v-if="node.type !== 'LED'" cx="106" cy="28" r="4.2" class="output-port" :class="{ 'port-started': wireStart?.id === node.id }" :aria-label="t('outputPin')" @pointerdown.stop.prevent="beginWire($event, node)" />
              </template>
              <template v-else>
                <line x1="83" y1="28" x2="106" y2="28" class="pin-stem" />
                <circle cx="106" :cy="outputLocalY(node)" r="4.2" class="output-port" :class="{ 'port-started': wireStart?.id === node.id }" :aria-label="t('outputPin')" @pointerdown.stop.prevent="beginWire($event, node)" />
              </template>
              <text x="58" :y="nodeCaptionY(node)" text-anchor="middle" class="node-caption">{{ node.label }}</text>
              <text v-if="node.type === 'INPUT' || node.type === 'VCC' || node.type === 'GND'" x="58" :y="nodeCaptionY(node) + 12" text-anchor="middle" class="node-subcaption">{{ node.type === 'INPUT' ? (node.value ? t('high') : t('low')) : node.type === 'VCC' ? 'LOGIC 1' : 'LOGIC 0' }}</text>
              <text v-else-if="node.type === 'LED'" x="58" :y="nodeCaptionY(node) + 12" text-anchor="middle" class="node-subcaption" :class="{ 'subcaption-high': isRunning && nodeDisplayValue(node) }">{{ nodeDisplayValue(node) ? 'HIGH · 1' : 'LOW · 0' }}</text>
            </g>
          </svg>

          <div class="canvas-hud canvas-hud-left">
            <span class="hud-square"></span>
            <span v-if="currentWireMessage" class="wire-message"><Cable :size="12" />{{ currentWireMessage }}</span>
            <span v-else>{{ t('canvasHint') }}</span>
          </div>
          <div class="canvas-hud canvas-hud-right"><span class="hud-grid-icon">⌗</span>24 px</div>
          <div v-if="nodes.length === 0" class="canvas-empty-state">
            <div class="empty-state-icon"><CircuitBoard :size="24" /></div>
            <strong>{{ language === 'fr' ? 'Votre circuit commence ici' : 'Your circuit starts here' }}</strong>
            <p>{{ t('dropHint') }}</p>
            <button class="empty-add-button" @click="addNode('INPUT')"><Plus :size="14" />{{ t('inputSwitch') }}</button>
          </div>
          <div v-if="wireStart" class="wire-cursor-help"><span></span>{{ t('startWire') }}</div>
        </div>

        <div v-if="!truthCollapsed && !truthFullscreen" class="horizontal-resizer" role="separator" aria-orientation="horizontal" :aria-label="language === 'fr' ? 'Redimensionner le tableau de vérité' : 'Resize truth table'" tabindex="0" @pointerdown="startResize($event, 'truth')" @keydown="resizeByKeyboard($event, 'truth')"><span></span></div>

        <section class="truth-panel" data-tour="truth-table" :class="{ collapsed: truthCollapsed, fullscreen: truthFullscreen }" :style="truthPanelStyle">
          <div class="truth-header">
            <div class="truth-heading-copy">
              <div class="truth-icon"><Activity :size="16" /></div>
              <div><h2>{{ t('truthTable') }}</h2><div class="truth-subtitle">{{ truthRows.length }} {{ t('combinations') }}<span class="truth-live-mark"><span></span>{{ language === 'fr' ? 'EN DIRECT' : 'LIVE' }}</span></div></div>
            </div>
            <div class="truth-header-actions">
              <span v-if="!truthCollapsed" class="truth-count-chip"><span>{{ truth.inputs.length }}</span>{{ language === 'fr' ? 'entrées' : 'inputs' }}<i></i><span>{{ truth.outputs.length }}</span>{{ language === 'fr' ? 'sorties' : 'outputs' }}</span>
              <button v-if="!truthCollapsed" class="copy-csv-button" :title="t('copyCsv')" @click="copyTruthTable"><Copy :size="13" /><span>{{ t('copyCsv') }}</span></button>
              <button class="truth-window-control" :title="t(truthFullscreen ? 'exitFullScreenTruth' : 'fullScreenTruth')" :aria-label="t(truthFullscreen ? 'exitFullScreenTruth' : 'fullScreenTruth')" @click="toggleTruthFullscreen">
                <Minimize2 v-if="truthFullscreen" :size="15" /><Maximize2 v-else :size="15" />
              </button>
              <button class="truth-window-control" :title="t(truthCollapsed ? 'showTruthTable' : 'hideTruthTable')" :aria-label="t(truthCollapsed ? 'showTruthTable' : 'hideTruthTable')" @click="toggleTruthPanel">
                <PanelBottomOpen v-if="truthCollapsed" :size="15" /><PanelBottomClose v-else :size="15" />
              </button>
            </div>
          </div>
          <template v-if="!truthCollapsed">
            <div class="truth-table-wrap">
              <table class="truth-table">
              <thead>
                <tr>
                  <th class="row-number-heading">{{ t('row') }}</th>
                  <th v-for="node in truth.inputs" :key="node.id" class="input-heading"><span>{{ node.label }}</span><small>{{ t('input') }}</small></th>
                  <th v-for="node in truth.outputs" :key="node.id" class="output-heading"><span class="output-heading-dot"></span><span>{{ node.label }}</span><small>{{ t('output') }}</small></th>
                  <th v-if="truth.outputs.length === 0" class="empty-output-heading"><span>…</span><small>{{ t('output') }}</small></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in truthRows" :key="row.index" :class="{ 'current-truth-row': currentRowMatches(row) }">
                  <td class="row-number">{{ String(row.index).padStart(2, '0') }}</td>
                  <td v-for="node in truth.inputs" :key="node.id" class="truth-value-cell"><span class="bit-pill" :class="row.inputs[node.id] ? 'bit-high' : 'bit-low'">{{ row.inputs[node.id] ? '1' : '0' }}</span></td>
                  <td v-for="node in truth.outputs" :key="node.id" class="truth-value-cell output-value-cell"><span class="bit-pill" :class="row.outputs[node.id] ? 'bit-high' : 'bit-low'">{{ row.outputs[node.id] ? '1' : '0' }}</span></td>
                  <td v-if="truth.outputs.length === 0" class="no-output-cell"><span>{{ t('noOutputs') }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
            <div v-if="truth.omittedInputs" class="truth-warning"><span>i</span>{{ t('tableLimit') }}</div>
          </template>
        </section>
      </main>

      <div v-if="!rightCollapsed" class="vertical-resizer right-resizer" role="separator" aria-orientation="vertical" :aria-label="language === 'fr' ? 'Redimensionner l’inspecteur' : 'Resize inspector'" tabindex="0" @pointerdown="startResize($event, 'right')" @keydown="resizeByKeyboard($event, 'right')"><span></span></div>

      <aside v-if="!rightCollapsed" data-tour="inspector-panel" class="inspector-panel" :class="{ 'mobile-open': mobilePanel === 'right' }" :style="{ width: `${rightWidth}px` }">
        <div class="panel-heading inspector-heading">
          <div><div class="panel-title">{{ t('properties') }}</div><div class="panel-subtitle">{{ selectedNode ? selectedNode.label : t('inspect') }}</div></div>
          <div class="panel-heading-actions">
            <button class="small-icon-button panel-collapse-button" :title="t('hideInspector')" :aria-label="t('hideInspector')" @click="toggleSidebar('right')"><PanelRightClose :size="15" /></button>
            <button class="small-icon-button mobile-close" :aria-label="t('close')" @click="mobilePanel = ''"><X :size="15" /></button>
          </div>
        </div>
        <div v-if="selectedNode" class="inspector-scroll">
          <div class="selected-component-card">
            <div class="selected-component-symbol" :class="`symbol-${selectedNode.type.toLowerCase()}`">
              <Lightbulb v-if="selectedNode.type === 'LED'" :size="19" />
              <span v-else>{{ selectedNode.type === 'INPUT' ? 'IN' : selectedNode.type === 'VCC' ? 'V+' : selectedNode.type === 'GND' ? 'GND' : selectedNode.type }}</span>
            </div>
            <div class="selected-component-copy"><strong>{{ componentTitle(selectedNode.type) }}</strong><span>{{ selectedNode.type === 'INPUT' ? t('inputHint') : GATE_TYPES.includes(selectedNode.type) ? gateDescription(selectedNode.type) : selectedNode.type === 'VCC' ? t('vccHint') : selectedNode.type === 'GND' ? t('groundHint') : t('ledHint') }}</span></div>
          </div>

          <div class="inspector-section">
            <div class="inspector-section-title">{{ t('component') }}</div>
            <label class="field-label" for="node-label">{{ t('name') }}</label>
            <input id="node-label" class="property-input" :value="selectedNode.label" maxlength="20" @change="renameSelected" />
          </div>

          <div class="signal-card" :class="{ 'signal-high': isSelectedOutputHigh }">
            <div class="signal-card-top"><span class="signal-pulse"></span><span>{{ t('signal') }}</span><span class="signal-spacer"></span><span class="signal-running" :class="{ paused: !isRunning }">{{ isRunning ? 'LIVE' : 'PAUSED' }}</span></div>
            <div class="signal-value-row"><strong>{{ isSelectedOutputHigh ? t('high') : t('low') }}</strong><span class="signal-binary">{{ isSelectedOutputHigh ? '1' : '0' }}</span></div>
            <div class="signal-meter"><span :style="{ width: isSelectedOutputHigh ? '100%' : '6%' }"></span></div>
          </div>

          <div v-if="['OR', 'NOR'].includes(selectedNode.type)" class="inspector-section gate-input-count-section">
            <div class="inspector-section-title">{{ t('gateInputCount') }}</div>
            <div class="gate-input-count-control">
              <button type="button" class="small-icon-button" :aria-label="t('removeGateInput')" :title="t('removeGateInput')" :disabled="inputCount(selectedNode) <= 2" @click="changeGateInputCount(selectedNode, -1)"><Minus :size="14" /></button>
              <strong>{{ inputCount(selectedNode) }}</strong>
              <button type="button" class="small-icon-button" :aria-label="t('addGateInput')" :title="t('addGateInput')" :disabled="inputCount(selectedNode) >= MAX_GATE_INPUTS" @click="changeGateInputCount(selectedNode, 1)"><Plus :size="14" /></button>
            </div>
          </div>
          <div v-if="inputCount(selectedNode)" class="inspector-section pin-section">
            <div class="inspector-section-title">{{ t('inputPins') }}</div>
            <div v-for="port in inputCount(selectedNode)" :key="port" class="connection-row">
              <span class="connection-port">{{ inputPinShortLabel(port - 1) }}</span>
              <span class="connection-name">{{ inputConnection(selectedNode, port - 1)?.label || inputPinName(port - 1) }}</span>
              <span class="connection-status" :class="{ connected: inputConnection(selectedNode, port - 1) }">{{ inputConnection(selectedNode, port - 1) ? t('connected') : t('unconnected') }}</span>
            </div>
          </div>
          <div v-else class="inspector-section pin-section">
            <div class="inspector-section-title">{{ t('outputPin') }}</div>
            <div class="connection-row"><span class="connection-port output-port-mark">↗</span><span class="connection-name">{{ t('outputPin') }}</span><span class="connection-status connected">{{ isSelectedOutputHigh ? '1 · HIGH' : '0 · LOW' }}</span></div>
          </div>

          <div v-if="selectedNode.type === 'INPUT'" class="toggle-property-row">
            <div><strong>{{ t('valueToggle') }}</strong><span>{{ language === 'fr' ? 'État initial' : 'Initial state' }}</span></div>
            <button class="property-toggle" :class="{ on: selectedNode.value }" :aria-pressed="selectedNode.value" :aria-label="t('valueToggle')" @click="toggleInput(selectedNode)"><span></span></button>
          </div>

          <div class="inspector-actions">
            <button class="secondary-action" @click="duplicateSelected"><Copy :size="14" />{{ t('duplicate') }}</button>
            <button class="danger-action" @click="deleteSelection"><Trash2 :size="14" />{{ t('delete') }}</button>
          </div>
        </div>
        <div v-else-if="selectedWire" class="inspector-scroll wire-inspector">
          <div class="selected-component-card">
            <div class="selected-component-symbol symbol-wire"><Cable :size="18" /></div>
            <div class="selected-component-copy"><strong>{{ language === 'fr' ? 'Fil de connexion' : 'Connection wire' }}</strong><span>{{ language === 'fr' ? 'Relie une sortie à une entrée.' : 'Routes one component output to an input.' }}</span></div>
          </div>
          <div class="inspector-section"><div class="inspector-section-title">{{ language === 'fr' ? 'Chemin du signal' : 'Signal path' }}</div><div class="wire-path-card"><span>{{ nodes.find((node) => node.id === selectedWire.from)?.label }}</span><ChevronRight :size="14" /><span>{{ nodes.find((node) => node.id === selectedWire.to)?.label }}</span></div></div>
          <div class="signal-card" :class="{ 'signal-high': wireIsHigh(selectedWire) }"><div class="signal-card-top"><span class="signal-pulse"></span><span>{{ t('signal') }}</span></div><div class="signal-value-row"><strong>{{ wireIsHigh(selectedWire) ? t('high') : t('low') }}</strong><span class="signal-binary">{{ wireIsHigh(selectedWire) ? '1' : '0' }}</span></div><div class="signal-meter"><span :style="{ width: wireIsHigh(selectedWire) ? '100%' : '6%' }"></span></div></div>
          <div class="inspector-actions single-action"><button class="danger-action" @click="deleteWireById(selectedWire.id)"><Trash2 :size="14" />{{ t('delete') }}</button></div>
        </div>
        <div v-else class="inspector-scroll empty-inspector">
          <div class="empty-inspector-card">
            <div class="inspector-empty-icon"><MousePointer2 :size="19" /></div>
            <strong>{{ t('nothingSelected') }}</strong>
            <p>{{ t('selectHelp') }}</p>
          </div>
          <div class="inspector-section summary-section">
            <div class="inspector-section-title">{{ t('circuitSummary') }}</div>
            <div class="summary-grid">
              <div><span>{{ t('componentsCount') }}</span><strong>{{ workspaceComponentCount.toString().padStart(2, '0') }}</strong></div>
              <div><span>{{ t('wiresCount') }}</span><strong>{{ wires.length.toString().padStart(2, '0') }}</strong></div>
              <div><span>{{ t('inputCountLabel') }}</span><strong>{{ inputNodes.length.toString().padStart(2, '0') }}</strong></div>
              <div><span>{{ t('outputCountLabel') }}</span><strong>{{ outputNodes.length.toString().padStart(2, '0') }}</strong></div>
            </div>
          </div>
          <div class="inspector-section tips-section">
            <div class="inspector-section-title">{{ t('quickTips') }}</div>
            <div class="quick-tip-row"><span class="quick-tip-number">01</span><span>{{ t('tipDrag') }}</span></div>
            <div class="quick-tip-row"><span class="quick-tip-number">02</span><span>{{ t('tipWire') }}</span></div>
            <div class="quick-tip-row"><span class="quick-tip-number">03</span><span>{{ t('tipToggle') }}</span></div>
            <div class="quick-tip-row"><span class="quick-tip-number">04</span><span>{{ t('tipOutputs') }}</span></div>
          </div>
          <div class="open-source-card">
            <div class="open-source-top"><span class="open-source-dot"></span>{{ t('openSource') }}</div>
            <div class="author-label">{{ t('by') }}</div>
            <a href="https://github.com/nour-yahyaoui" target="_blank" rel="noreferrer" class="author-link">Nour Yahyaoui <ExternalLink :size="12" /></a>
            <a href="https://github.com/Nour-yahyaoui/multisim-pro" target="_blank" rel="noreferrer" class="repo-link">github.com/Nour-yahyaoui/multisim-pro <ExternalLink :size="11" /></a>
          </div>
        </div>
        <div class="inspector-footer"><span class="footer-online-dot"></span>{{ t('simHint') }}</div>
      </aside>
    </div>

    <div v-if="toastMessage" class="toast-message"><span class="toast-check"><Check :size="13" /></span>{{ toastMessage }}</div>

    <div v-if="showHelp" class="modal-backdrop" @pointerdown.self="showHelp = false" @keydown.esc="showHelp = false">
      <section class="help-modal" role="dialog" aria-modal="true" :aria-label="t('helpTitle')">
        <div class="modal-heading"><div class="modal-icon"><CircuitBoard :size="19" /></div><div><h2>{{ t('helpTitle') }}</h2><p>{{ language === 'fr' ? 'Un atelier de logique simple, local et libre.' : 'A simple, local-first, open-source logic workbench.' }}</p></div><button class="small-icon-button" :aria-label="t('close')" @click="showHelp = false"><X :size="16" /></button></div>
        <div class="help-steps">
          <div class="help-step"><span>01</span><div><strong>{{ t('helpStep1Title') }}</strong><p>{{ t('helpStep1') }}</p></div></div>
          <div class="help-step"><span>02</span><div><strong>{{ t('helpStep2Title') }}</strong><p>{{ t('helpStep2') }}</p></div></div>
          <div class="help-step"><span>03</span><div><strong>{{ t('helpStep3Title') }}</strong><p>{{ t('helpStep3') }}</p></div></div>
        </div>
        <div class="shortcut-box"><strong>{{ t('keyboard') }}</strong><div><kbd>⌘ / Ctrl</kbd><kbd>Z</kbd><span>{{ t('shortcutUndo') }}</span></div><div><kbd>⌘ / Ctrl</kbd><kbd>Shift</kbd><kbd>Z</kbd><span>{{ t('shortcutRedo') }}</span></div><div><kbd>Delete</kbd><span>{{ t('shortcutDelete') }}</span></div></div>
        <div class="modal-footer"><a href="https://github.com/Nour-yahyaoui/multisim-pro" target="_blank" rel="noreferrer"><ExternalLink :size="13" />{{ language === 'fr' ? 'Voir le dépôt GitHub' : 'View the GitHub repository' }}</a><button class="tour-restart-button" @click="startTour"><MousePointer2 :size="13" />{{ t('tourReplay') }}</button><button class="modal-done-button" @click="showHelp = false">{{ t('close') }}<Check :size="14" /></button></div>
      </section>
    </div>

    <div v-if="tourActive" class="tour-overlay" @keydown.esc.stop.prevent="skipTour">
      <div v-for="(shade, index) in tourShadeStyles" :key="index" class="tour-shade" :style="shade"></div>
      <div v-if="tourTargetRect" class="tour-focus-frame" :style="tourFocusStyle" aria-hidden="true"></div>
      <div v-if="tourTargetRect && !currentTourStep?.interactive" class="tour-target-guard" :style="tourGuardStyle" aria-hidden="true"></div>
      <MousePointer2 v-if="tourTargetRect" class="tour-pointer" :size="32" :style="tourPointerStyle" aria-hidden="true" />
      <section ref="tourCard" class="tour-card" :class="{ centered: !tourTargetRect }" :style="tourCardStyle" role="dialog" aria-modal="true" aria-labelledby="tour-step-title" aria-describedby="tour-step-body" tabindex="-1">
        <div class="tour-card-topline">
          <div class="tour-kicker"><span class="tour-kicker-dot"></span>{{ tourKicker }}</div>
          <button type="button" class="tour-skip" @click="skipTour">{{ t('tourSkip') }}</button>
        </div>
        <div class="tour-progress-track" role="progressbar" :aria-valuenow="tourProgress" aria-valuemin="0" aria-valuemax="100" :aria-label="tourKicker"><div class="tour-progress-fill" :style="{ width: `${tourProgress}%` }"></div></div>
        <h2 id="tour-step-title" aria-live="polite">{{ currentTourStep?.title }}</h2>
        <p id="tour-step-body" class="tour-card-body">{{ currentTourStep?.body }}</p>
        <div class="tour-card-footer">
          <button v-if="tourStep > 0" type="button" class="tour-back-button" @click="tourPrevious"><ChevronRight :size="14" class="tour-back-chevron" />{{ t('tourBack') }}</button>
          <button type="button" class="tour-primary-button" @click="tourNext">{{ tourStep === 0 ? t('tourBegin') : tourStep === tourLastStep ? t('tourFinish') : t('tourNext') }}<Check v-if="tourStep === tourLastStep" :size="14" /><ChevronRight v-else :size="14" /></button>
        </div>
      </section>
    </div>

    <InviteModal v-if="isInviteRoute" />
  </div>
</template>

<style>
@import './style.css';
</style>
