import macro from 'vtk.js/Sources/macro';
import vtkMath from 'vtk.js/Sources/Common/Core/Math';
import vtkPlane from 'vtk.js/Sources/Common/DataModel/Plane';
import vtkPointPicker from 'vtk.js/Sources/Rendering/Core/PointPicker';
import vtkAbstractWidget from 'vtk.js/Sources/Interaction/Widgets/AbstractWidget';
import vtkSelectionRepresentation from '../SelectionRepresentation';
import Constants from './Constants';
import {mat4, vec3} from 'gl-matrix';

const {vtkErrorMacro, VOID, EVENT_ABORT} = macro;
const {TOTAL_NUM_HANDLES, WidgetState, SelectionState, CropWidgetEvents} = Constants;

// ----------------------------------------------------------------------------
// vtkSelectionWidget methods
// ----------------------------------------------------------------------------
function arrayEquals(a, b) {
  if (a.length === b.length) {
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  return false;
}


function vtkSelectionWidget(publicAPI, model) {
  model.sliceValue = null;
  model.mirror = false;
  model.xAxisMiddelValue = null;
  model.colorInitial = [1, 1, 1];
  model.colorSelect = [0, 1, 0];
  // Set our className
  model.classHierarchy.push('vtkSelectionWidget');

  const annotationPicker = vtkPointPicker.newInstance();
  annotationPicker.setPickFromList(1);
  annotationPicker.initializePickList();

  // camera subscription
  let cameraSub = null;

  model.indexToWorld = mat4.create();
  model.worldToIndex = mat4.create();

  let handlesCache = null;

  model.widgetState = {
    activeHandleIndex: -1,
    planes: Array(6)
      .fill(0),
    controlState: WidgetState.IDLE
  };

  model.selectionState = {
    controlState: SelectionState.DEFAULT
  };

  function indexToWorld(ain) {
    const vin = vec3.fromValues(ain[0], ain[1], ain[2]);
    const vout = vec3.create();
    vec3.transformMat4(vout, vin, model.indexToWorld);
    return [vout[0], vout[1], vout[2]];
  }

  // Overriden method
  publicAPI.createDefaultRepresentation = () => {
    if (!model.widgetRep) {
      model.widgetRep = vtkSelectionRepresentation.newInstance();
      model.widgetRep.setColorInitial(model.colorInitial);
      model.widgetRep.setColorSelect(model.colorSelect);
      publicAPI.updateRepresentation();
    }
  };

  publicAPI.setColorBasic = (color) => {
    model.colorInitial = color;
  };

  publicAPI.setColorSelect = (color) => {
    model.colorSelect = color;
  };

  publicAPI.getWidgetState = () => Object.assign({}, model.widgetState);

  publicAPI.getSelectionState = () => Object.assign({}, model.selectionState);

  publicAPI.updateWidgetState = (state) => {
    const needsUpdate = Object.keys(state)
      .reduce(
        (flag, key) => flag || model.widgetState[key] !== state[key],
        false
      );

    if (needsUpdate) {
      const oldState = model.widgetState;
      model.widgetState = Object.assign({}, oldState, state);

      if (!arrayEquals(oldState.planes, model.widgetState.planes)) {
        // invalidate handles cache
        handlesCache = null;
        publicAPI.invokeCroppingPlanesChanged(model.widgetState.planes);
      }

      publicAPI.updateRepresentation();
      publicAPI.modified();
    }
  };

  publicAPI.setSelectionHandle = (selectionHandle) => {
    model.selectionHandle = selectionHandle;
  };

  publicAPI.setVolumeMapper = (volumeMapper) => {
    if (volumeMapper !== model.volumeMapper) {
      model.volumeMapper = volumeMapper;
      if (model.sliceValue === null) {
        model.sliceValue = Math.round(model.volumeMapper.getBounds()[5] / 2);
      }
      model.xAxisMiddelValue = Math.round(model.volumeMapper.getBounds()[0] / 2);
      publicAPI.resetWidgetState();
      if (model.enabled) {
        publicAPI.updateRepresentation();
      }
    }
  };

  publicAPI.planesToHandles = (planes) => {
    if (!model.volumeMapper || !model.volumeMapper.getInputData()) {
      return null;
    }

    if (handlesCache) {
      return handlesCache;
    }

    // coords are in world space.
    // a null handle means it is disabled
    const handles = Array(TOTAL_NUM_HANDLES)
      .fill(null);

    if (model.cornerHandlesEnabled) {
      // construct corner handles
      for (let i = 0; i < 1; ++i) {
        /* eslint-disable no-bitwise */
        handles[i] = [
          planes[((i >> 2) & 0x1)],
          planes[2 + ((i >> 1) & 0x1)],
          planes[4 + ((i >> 0) & 0x1)]
        ];
        /* eslint-enable no-bitwise */
      }
    }

    // transform handles from index to world space
    for (let i = 0; i < handles.length; ++i) {
      if (handles[i]) {
        handles[i] = indexToWorld(handles[i]);
      }
    }

    handlesCache = handles;
    return handles;
  };

  publicAPI.getCorners = (planes) => {
    if (!model.volumeMapper || !model.volumeMapper.getInputData()) {
      return null;
    }
    return [[planes[0], planes[2], planes[4]]].map((coord) => indexToWorld(coord));
  };

  publicAPI.resetWidgetState = () => {
    if (!model.volumeMapper) {
      vtkErrorMacro('Volume mapper must be set to update representation');
      return;
    }
    if (!model.volumeMapper.getInputData()) {
      vtkErrorMacro('Volume mapper has no input data');
      return;
    }

    const data = model.volumeMapper.getInputData();

    // cache transforms
    model.indexToWorld = data.getIndexToWorld();
    model.worldToIndex = data.getWorldToIndex();

    const planes = data.getExtent();
    publicAPI.setCroppingPlanes(...planes);
  };

  publicAPI.setEnabled = macro.chain(publicAPI.setEnabled, (enable) => {
    if (cameraSub) {
      cameraSub.unsubscribe();
    }

    if (enable) {
      const camera = publicAPI
        .getInteractor()
        .getCurrentRenderer()
        .getActiveCamera();
      cameraSub = camera.onModified(publicAPI.updateRepresentation);
      publicAPI.updateRepresentation();
    }
  });

  publicAPI.setFaceHandlesEnabled = (enabled) => {
    // intentionally left blank
  };

  publicAPI.setEdgeHandlesEnabled = (enabled) => {
    // intentionally left blank
  };

  /**
   * Enables the control of the selector
   * @param enabled
   *    If enabled the control is carried out
   */
  publicAPI.setCornerHandlesEnabled = (enabled) => {
    if (model.cornerHandlesEnabled !== enabled) {
      model.cornerHandlesEnabled = enabled;
      publicAPI.updateRepresentation();
      publicAPI.modified();
    }
  };

  /**
   * Used to control the size of the selection
   * @param size
   *    The size the selector should have
   */
  publicAPI.setHandleSize = (size) => {
    if (model.handleSize !== size) {
      model.handleSize = size;
      publicAPI.updateRepresentation();
      publicAPI.modified();
    }
  };

  publicAPI.getCroppingPlanes = () => model.widgetState.planes.slice();

  publicAPI.setCroppingPlanes = (...planes) => {
    publicAPI.updateWidgetState({planes});
  };

  publicAPI.updateRepresentation = () => {
    if (model.widgetRep) {
      const bounds = model.volumeMapper.getBounds();
      model.widgetRep.placeWidget(...bounds);

      const {activeHandleIndex, planes} = model.widgetState;

      const bboxCorners = publicAPI.getCorners(planes);
      const handlePositions = publicAPI.planesToHandles(planes);
      model.handlePosition = handlePositions;
      const handleSizes = handlePositions.map((handle) => {
        if (!handle) {
          return model.handleSize;
        }
        return publicAPI.adjustHandleSize(model.handleSize);
      });

      if (model.selectionHandle != null) {
        model.selectionHandle([model.handlePosition[0][0], model.handlePosition[0][1], model.handlePosition[0][2], model.handleSize]);
      }

      model.widgetRep.set({
        activeHandleIndex,
        handlePositions,
        bboxCorners,
        handleSizes
      });

      publicAPI.render();
    }
  };

  publicAPI.adjustHandleSize = (size) => {
    if (size != null) {
      return size;
    }
    return 5;
  };

  // Given display coordinates and a plane, returns the
  // point on the plane that corresponds to display coordinates.
  publicAPI.displayToPlane = (displayCoords, planePoint, planeNormal) => {
    const view = publicAPI.getInteractor()
      .getView();
    const renderer = publicAPI.getInteractor()
      .getCurrentRenderer();
    const camera = renderer.getActiveCamera();

    const cameraFocalPoint = camera.getFocalPoint();
    const cameraPos = camera.getPosition();

    // Adapted from vtkPicker
    const focalPointDispCoords = view.worldToDisplay(
      ...cameraFocalPoint,
      renderer
    );
    const worldCoords = view.displayToWorld(
      displayCoords[0],
      displayCoords[1],
      focalPointDispCoords[2], // Use focal point for z coord
      renderer
    );

    // compute ray from camera to selection
    const ray = [0, 0, 0];
    for (let i = 0; i < 3; ++i) {
      ray[i] = worldCoords[i] - cameraPos[i];
    }

    const dop = camera.getDirectionOfProjection();
    vtkMath.normalize(dop);
    const rayLength = vtkMath.dot(dop, ray);

    const clipRange = camera.getClippingRange();

    const p1World = [0, 0, 0];
    const p2World = [0, 0, 0];

    // get line segment coords from ray based on clip range
    if (camera.getParallelProjection()) {
      const tF = clipRange[0] - rayLength;
      const tB = clipRange[1] - rayLength;
      for (let i = 0; i < 3; i++) {
        p1World[i] = worldCoords[i] + tF * dop[i];
        p2World[i] = worldCoords[i] + tB * dop[i];
      }
    } else {
      const tF = clipRange[0] / rayLength;
      const tB = clipRange[1] / rayLength;
      for (let i = 0; i < 3; i++) {
        p1World[i] = cameraPos[i] + tF * ray[i];
        p2World[i] = cameraPos[i] + tB * ray[i];
      }
    }

    const r = vtkPlane.intersectWithLine(
      p1World,
      p2World,
      planePoint,
      planeNormal
    );
    return r.intersection ? r.x : null;
  };

  publicAPI.handleLeftButtonPress = (callData) =>
    publicAPI.pressAction(callData);

  publicAPI.handleLeftButtonRelease = (callData) =>
    publicAPI.endMoveAction(callData);

  publicAPI.handleMiddleButtonPress = (callData) =>
    publicAPI.pressAction(callData);

  publicAPI.handleMiddleButtonRelease = (callData) =>
    publicAPI.endMoveAction(callData);

  publicAPI.handleRightButtonPress = (callData) =>
    publicAPI.pressAction(callData);

  publicAPI.handleRightButtonRelease = (callData) =>
    publicAPI.endMoveAction(callData);

  publicAPI.handleMouseMove = (callData) => publicAPI.moveAction(callData);

  publicAPI.selectorPlaceToMirror = (value) => {
    if (!model.primarySelector && model.xAxisMiddelValue !== null && model.mirror) {
      const handles = publicAPI.planesToHandles(model.widgetState.planes);
      publicAPI.setHandleSize(value[3]);
      handles[0] = [model.xAxisMiddelValue - (value[0] - model.xAxisMiddelValue), value[1], value[2]];
      publicAPI.updateRepresentation();
      publicAPI.modified();
    } else {
      model.valueSave = value;
    }
  };

  publicAPI.setSliceInformation = (name, value) => {
    if (name === 'z') {
      model.sliceValue = value;
    }
  };

  publicAPI.setStateToPlane = () => {
    model.selectionState.controlState = SelectionState.PLANE;
  }

  publicAPI.setStateToDepth = () => {
    model.selectionState.controlState = SelectionState.DEPTH;
  }

  publicAPI.setStateToFree = () => {
    model.selectionState.controlState = SelectionState.DEFAULT;
  }

  publicAPI.setMirrorState = (mirror) => {
    model.mirror = mirror;
    if (mirror && model.valueSave !== null) {
      publicAPI.selectorPlaceToMirror(model.valueSave);
    }
  }

  publicAPI.snapToSlice = () => {
    const handles = publicAPI.planesToHandles(model.widgetState.planes);
    handles[0] = [handles[0][0], handles[0][1], model.sliceValue];
    publicAPI.updateRepresentation();
    publicAPI.modified();
  }
  let mousePos = null;

  publicAPI.pressAction = (callData) => {
    if (model.widgetState.controlState === WidgetState.IDLE) {
      const handleIndex = model.widgetRep.getEventIntersection(callData);
      if (handleIndex > -1) {
        model.activeHandleIndex = handleIndex;
        if (callData.type === 'LeftButtonPress') {
          publicAPI.updateWidgetState({
            activeHandleIndex: handleIndex,
            controlState: WidgetState.SELECTING
          });
        } else if (callData.type === 'RightButtonPress') {
          mousePos = [callData.position.x, callData.position.y];
          publicAPI.updateWidgetState({
            activeHandleIndex: handleIndex,
            controlState: WidgetState.SIZING
          });
        }
        return EVENT_ABORT;
      }
    }
    return VOID;
  }
  ;

  publicAPI.moveAction = (callData) => {
    const {controlState, planes, activeHandleIndex} = model.widgetState;
    if (controlState === WidgetState.IDLE || activeHandleIndex === -1) {
      return VOID;
    }

    const handles = publicAPI.planesToHandles(planes);
    const mouse = [callData.position.x, callData.position.y];
    const handlePos = handles[activeHandleIndex];
    const renderer = publicAPI.getInteractor()
      .getCurrentRenderer();
    const camera = renderer.getActiveCamera();
    const dop = camera.getDirectionOfProjection();

    const point = publicAPI.displayToPlane(mouse, handlePos, dop);

    if (!point) {
      return EVENT_ABORT;
    }

    // console.log("User Selected a point so move it");

    if (controlState === WidgetState.SIZING) {
      let distance = Math.sqrt(Math.pow((mousePos[0] - mouse[0]), 2) + Math.pow((mousePos[1] - mouse[1]), 2));
      let direction = mousePos[0] < mouse[0] || mousePos[1] < mouse[1] ? -1 : 1;
      let size = model.handleSize + direction * distance / 100;
      if (size < 2) {
        size = 2;
      }
      publicAPI.setHandleSize(size);
    } else {
      // Check the Selection state
      // console.log(model.selectionState.controlState);
      const renderPosition = callData.position;
      annotationPicker.pick(
        [renderPosition.x, renderPosition.y, 0.0],
        callData.pokedRenderer
      );
      // console.log(handles[activeHandleIndex] + ' ' + annotationPicker.getPickPosition());

      const newPosition = annotationPicker.getPickPosition();
      if (model.selectionState.controlState === SelectionState.DEFAULT) {
        handles[activeHandleIndex] = newPosition;
      } else if (model.selectionState.controlState === SelectionState.PLANE) {
        handles[activeHandleIndex] = [newPosition[0], newPosition[1], handles[activeHandleIndex][2]];
      } else if (model.selectionState.controlState === SelectionState.DEPTH) {
        handles[activeHandleIndex] = [handles[activeHandleIndex][0], handles[activeHandleIndex][1], newPosition[2]];
      }
      publicAPI.updateRepresentation();
      publicAPI.modified();
    }
  };

  publicAPI.endMoveAction = () => {
    if (model.widgetState.activeHandleIndex > -1) {
      publicAPI.updateWidgetState({
        activeHandleIndex: -1,
        controlState: WidgetState.IDLE
      });
    }
  };
};


// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  // volumeMapper: null,
  handleSize: 5,
  faceHandlesEnabled: false,
  edgeHandlesEnabled: false,
  cornerHandlesEnabled: true
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Inheritance
  // Have our default values override whatever is from parent class
  vtkAbstractWidget.extend(publicAPI, model, DEFAULT_VALUES, initialValues);

  CropWidgetEvents.forEach((eventName) =>
    macro.event(publicAPI, model, eventName)
  );

  macro.get(publicAPI, model, [
    'volumeMapper',
    'handleSize',
    'faceHandlesEnabled',
    'edgeHandlesEnabled',
    'cornerHandlesEnabled'
  ]);

  // Object methods
  vtkSelectionWidget(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(
  extend,
  'vtkSelectionWidget'
);

// ----------------------------------------------------------------------------

export default {
  newInstance,
  extend
};
