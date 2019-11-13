const WidgetState = {
  IDLE: 0,
  SELECTING: 1,
  SIZING: 2,
  SELECTION_DEPTH: 3,
  SELECTION_PLANE: 4,
  MIRROR: 5,
};

const SelectionState = {
  DEFAULT: 0,
  DEPTH: 1,
  PLANE: 2,
};

const CropWidgetEvents = ['CroppingPlanesChanged'];

const TOTAL_NUM_HANDLES = 1;

export default { TOTAL_NUM_HANDLES, WidgetState, SelectionState, CropWidgetEvents };
