import macro from "vtk.js/Sources/macro";
import vtkMath from "vtk.js/Sources/Common/Core/Math";
import vtkCellPicker from "vtk.js/Sources/Rendering/Core/CellPicker";
import vtkActor from "vtk.js/Sources/Rendering/Core/Actor";
import vtkWidgetRepresentation from "vtk.js/Sources/Interaction/Widgets/WidgetRepresentation";
import vtkMapper from "vtk.js/Sources/Rendering/Core/Mapper";
import vtkPolyData from "vtk.js/Sources/Common/DataModel/PolyData";
import vtkSphereSource from "vtk.js/Sources/Filters/Sources/SphereSource";
import Constants from "../SelectionWidget/Constants";

const { TOTAL_NUM_HANDLES } = Constants;

// ----------------------------------------------------------------------------
// vtkSelectionRepresentation methods
// ----------------------------------------------------------------------------

// Reorders a bounds array such that each (a,b) pairing is a
// (min,max) pairing.
function reorderBounds(bounds) {
  for (let i = 0; i < 6; i += 2) {
    if (bounds[i] > bounds[i + 1]) {
      const tmp = bounds[i + 1];
      bounds[i + 1] = bounds[i];
      bounds[i] = tmp;
    }
  }
}

function vtkSelectionRepresentation(publicAPI, model) {
  // Set our className
  model.classHierarchy.push("vtkSelectionRepresentation");

  // set fields from parent classes
  model.placeFactor = 1;

  model.colorInitial = [1, 1, 1];
  model.colorSelect = [0, 1, 0];

  model.picker = vtkCellPicker.newInstance();
  model.picker.setPickFromList(1);
  model.picker.initializePickList();

  model.handles = Array(TOTAL_NUM_HANDLES)
    .fill(null)
    .map(() => {
      const source = vtkSphereSource.newInstance();
      const mapper = vtkMapper.newInstance();
      const actor = vtkActor.newInstance();

      mapper.setInputConnection(source.getOutputPort());
      actor.setMapper(mapper);

      model.picker.addPickList(actor);

      return { source, mapper, actor };
    });

  model.outline = {
    polydata: vtkPolyData.newInstance(),
    mapper: vtkMapper.newInstance(),
    actor: vtkActor.newInstance()
  };
  // 8 corners for a box
  model.outline.polydata.getPoints().setData(new Float32Array(8 * 3), 3);
  model.outline.mapper.setInputData(model.outline.polydata);
  model.outline.actor.setMapper(model.outline.mapper);

  // methods
  publicAPI.setColorInitial = (color) => {
    console.log("Set color Initial " + color);
    model.colorInitial = color;
    publicAPI.updateGeometry();
  };

  publicAPI.setColorSelect = (color) => {
    console.log("Set color select " + color);
    console.log("Set color select " + color);
    model.colorSelect = color;
    publicAPI.updateGeometry();
  };

  publicAPI.getActors = () => {
    const actors = [model.outline.actor];
    for (let i = 0; i < model.handlePositions.length; ++i) {
      if (model.handlePositions[i]) {
        actors.push(model.handles[i].actor);
      }
    }
    return actors;
  };

  publicAPI.getNestedProps = () => publicAPI.getActors();

  // outline mapper substitutes for the crop widget rep mapper
  publicAPI.getMapper = () => model.outline.mapper;

  publicAPI.getEventIntersection = (callData) => {
    const { x, y, z } = callData.position;
    model.picker.pick([x, y, z], callData.pokedRenderer);
    const actors = model.picker.getActors();
    if (actors.length) {
      let actorIndex = 0;

      // get actor closest to camera
      if (actors.length > 1) {
        const dists = model.picker.getPickedPositions().map((pt) => {
          const camPos = callData.pokedRenderer.getActiveCamera().getPosition();
          return vtkMath.distance2BetweenPoints(camPos, pt);
        });

        let minDist = Infinity;
        dists.forEach((d, i) => {
          if (minDist > d) {
            actorIndex = i;
            minDist = d;
          }
        });
      }

      const actor = actors[actorIndex];
      return model.handles.findIndex((h) => h.actor === actor);
    }
    return -1;
  };

  publicAPI.placeWidget = (...bounds) => {
    const boundsArray = [];

    for (let i = 0; i < bounds.length; i++) {
      boundsArray.push(bounds[i]);
    }

    if (boundsArray.length !== 6) {
      return;
    }

    // make sure each bounds pairing is monotonic
    reorderBounds(boundsArray);

    const newBounds = [];
    const center = [];
    publicAPI.adjustBounds(boundsArray, newBounds, center);

    for (let i = 0; i < 6; i++) {
      model.initialBounds[i] = newBounds[i];
    }

    model.initialLength = Math.sqrt(
      (newBounds[1] - newBounds[0]) * (newBounds[1] - newBounds[0]) +
      (newBounds[3] - newBounds[2]) * (newBounds[3] - newBounds[2]) +
      (newBounds[5] - newBounds[4]) * (newBounds[5] - newBounds[4])
    );

    publicAPI.modified();
  };

  // Force update the geometry
  publicAPI.updateGeometry = () => {
    const outlinePoints = model.outline.polydata.getPoints().getData();

    for (let i = 0; i < model.handles.length; ++i) {
      if (model.handlePositions[i]) {
        const { actor, source } = model.handles[i];
        source.setRadius(model.handleSizes[i]);    // => TODO adapt radius
        source.setCenter(model.handlePositions[i]);
        source.setThetaResolution(20);
        source.setPhiResolution(20);

        if (model.activeHandleIndex === i) {
          // actor.getProperty().setColor(1, 0, 0);
          actor.getProperty().setColor(model.colorSelect[0], model.colorSelect[1], model.colorSelect[2]);
        } else {
          actor.getProperty().setColor(model.colorInitial[0], model.colorInitial[1], model.colorInitial[2]);
        }
      }
    }

    for (let i = 0; i < model.bboxCorners.length; ++i) {
      outlinePoints.set(model.bboxCorners[i], i * 3);
    }

    model.outline.actor.getProperty().setEdgeColor(...model.edgeColor);

    model.outline.polydata.getPoints().modified();
    model.outline.polydata.modified();
  };

  publicAPI.getBounds = () => model.initialBounds;

  publicAPI.buildRepresentation = () => {
    if (model.renderer) {
      if (!model.placed) {
        model.validPick = 1;
        model.placed = 1;
      }

      publicAPI.updateGeometry();
    }
  };

  publicAPI.setProperty = (property) => {
    model.actor.setProperty(property);
  };

  // modifications will result in geometry updates
  publicAPI.onModified(publicAPI.updateGeometry);
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  activeHandleIndex: -1,
  handlePositions: Array(TOTAL_NUM_HANDLES).fill(null),
  handleSizes: Array(TOTAL_NUM_HANDLES).fill(0),
  bboxCorners: Array(1).fill([0, 0, 0]),
  edgeColor: [1.0, 1.0, 1.0]
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Inheritance
  vtkWidgetRepresentation.extend(publicAPI, model, initialValues);

  macro.setGet(publicAPI, model, ["activeHandleIndex"]);
  macro.setGetArray(publicAPI, model, ["edgeColor"], 3);
  macro.setGetArray(publicAPI, model, ["handlePositions"], TOTAL_NUM_HANDLES);
  macro.setGetArray(publicAPI, model, ["handleSizes"], TOTAL_NUM_HANDLES);
  macro.setGetArray(publicAPI, model, ["bboxCorners"], 1);

  // Object methods
  vtkSelectionRepresentation(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(
  extend,
  "vtkSelectionRepresentation"
);

// ----------------------------------------------------------------------------

export default { newInstance, extend };
