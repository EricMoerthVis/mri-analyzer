import style from './MriAnalyzer.module.css';

import getContrastSensitiveStyle from './getContrastSensitiveStyle';

import moveDepthIcon from './icons/moveDepth.svg';
import moveFreeIcon from './icons/moveFree.svg';
import movePlaneIcon from './icons/movePlane.svg';
import mirrorIcon from './icons/mirror.svg';
import vtkTumorSelectWidget from './widget/SelectionWidget';
import tumorIcon from './icons/tumor.svg';
import controlIcon from './icons/control.svg';
import snapTumorToPlaneIcon from './icons/snapTumorToPlane.svg';
import snapCompareToPlaneIcon from './icons/snapCompareToPlane.svg';
import toggleIcon from './icons/toggle.svg';

/**
 * https://css-tricks.com/converting-color-spaces-in-javascript/
 * @param h
 * @param isPct
 * @returns {number[]}
 */
function hexToRGB(h, isPct) {
  let r = 0,
    g = 0,
    b = 0;

  if (h.length === 4) {
    r = `0x${h[1]}${h[1]}`;
    g = `0x${h[2]}${h[2]}`;
    b = `0x${h[3]}${h[3]}`;
  } else if (h.length === 7) {
    r = `0x${h[1]}${h[2]}`;
    g = `0x${h[3]}${h[4]}`;
    b = `0x${h[5]}${h[6]}`;
  }

  if (isPct) {
    r = +(r / 255 * 100).toFixed(1);
    g = +(g / 255 * 100).toFixed(1);
    b = +(b / 255 * 100).toFixed(1);
  }

  return [r / 100, g / 100, b / 100];
}


function createSelectionWidgetUI(
  uiContainer,
  viewerDOMId,
  isBackgroundDark,
  imageRepresentation,
  view,
  tumorHandle,
  compareHandle,
  colors
) {
  if (!(colors === null || colors === undefined)) {
    // eslint-disable-next-line no-param-reassign
    colors = {
      tumor: hexToRGB(colors.tumor, true),
      compare: hexToRGB(colors.compare, true)
    };
  } else {
    // eslint-disable-next-line no-param-reassign
    colors = {
      tumor: [0.8157, 0.2392, 0.215686],
      compare: [0, 0.647, 0.098]
    };
  }

  const contrastSensitiveStyle = getContrastSensitiveStyle(
    ['invertibleButton', 'tooltipButton'],
    isBackgroundDark
  );

  const mainUIGroup = document.createElement('div');
  mainUIGroup.setAttribute('class', style.uiGroup);

  const mainUIRow = document.createElement('div');
  mainUIRow.setAttribute('class', style.mainUIRow);
  mainUIRow.className += ` ${viewerDOMId}-toggle`;
  mainUIGroup.appendChild(mainUIRow);

  /**
   * *********************************
   * TUMOR INTERACTION FUNCTIONALITIES
   * *********************************
   * START
   */
    // console.log(`Compare color:${hexToRGB(colors.compare)}`);
  const compareWidget = vtkTumorSelectWidget.newInstance();
  compareWidget.setHandleSize(5);
  compareWidget.setColorBasic(colors.compare);
  compareWidget.setColorSelect(colors.compare);
  compareWidget.setFaceHandlesEnabled(false);
  compareWidget.setSelectionHandle(compareHandle);
  compareWidget.setEdgeHandlesEnabled(false);
  compareWidget.setCornerHandlesEnabled(true);
  compareWidget.setInteractor(view.getInteractor());
  compareWidget.setEnabled(false);
  compareWidget.setVolumeMapper(imageRepresentation.getMapper());
  let controlSelectionEnabled = false;

  /**/
  // console.log(`Tumor color:${hexToRGB(colors.tumor)}`);
  const tumorWidget = vtkTumorSelectWidget.newInstance();
  tumorWidget.setHandleSize(5);
  tumorWidget.setColorBasic(colors.tumor);
  tumorWidget.setColorSelect(colors.tumor);
  tumorWidget.setSelectionHandle((value) => {
    compareWidget.selectorPlaceToMirror(value);
    if (tumorHandle != null) {
      tumorHandle(value);
    }
  });
  tumorWidget.setFaceHandlesEnabled(false);
  tumorWidget.setEdgeHandlesEnabled(false);
  tumorWidget.setCornerHandlesEnabled(true);
  tumorWidget.setInteractor(view.getInteractor());
  tumorWidget.setEnabled(false);
  tumorWidget.setVolumeMapper(imageRepresentation.getMapper());

  // const widgetSphereRep = vtkSphereHandleRepresentation.newInstance();

  let tumorSelectionEnabled = false;

  function toggleTumorSelection() {
    tumorSelectionEnabled = !tumorSelectionEnabled;
    tumorWidget.setEnabled(tumorSelectionEnabled);
    if (!tumorSelectionEnabled && tumorHandle !== undefined) {
      tumorHandle(null);
    }
  }

  const tumorButton = document.createElement('div');
  tumorButton.innerHTML = `<input id="${viewerDOMId}-toggleTumorSelector" type="checkbox" class="${
    style.toggleInput
  }"><label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Select Tumor" class="${
    contrastSensitiveStyle.invertibleButton
  } ${style.tumorButton} ${
    style.toggleButton
  }" for="${viewerDOMId}-toggleTumorSelector">${tumorIcon}</label>`;
  tumorButton.addEventListener('change', (event) => {
    toggleTumorSelection();
  });
  mainUIRow.appendChild(tumorButton);


  function toggleControlSelection() {
    controlSelectionEnabled = !controlSelectionEnabled;
    compareWidget.setEnabled(controlSelectionEnabled);
    if (!controlSelectionEnabled && compareHandle !== undefined) {
      compareHandle(null);
    }
  }

  const compareButton = document.createElement('div');
  compareButton.innerHTML = `<input id="${viewerDOMId}-toggleControlSelector" type="checkbox" class="${
    style.toggleInput
  }"><label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Select Control area" class="${
    contrastSensitiveStyle.invertibleButton
  } ${style.compareButton} ${style.toggleButton}" for="${viewerDOMId}-toggleControlSelector">${controlIcon}</label>`;

  compareButton.addEventListener('change', (event) => {
    toggleControlSelection();
  });
  mainUIRow.appendChild(compareButton);

  /** END
   * *********************************
   * TUMOR INTERACTION FUNCTIONALITIES
   * *********************************
   */

  const moveFreeButton = document.createElement('div');
  moveFreeButton.innerHTML = `<input id="${viewerDOMId}-toggleFreeButtonSelector" type="checkbox" class="${
    style.toggleInput
  }"><label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Move selection freely" class="${
    contrastSensitiveStyle.invertibleButton
  } ${style.moveFreeButton} ${
    style.toggleButton
  }" for="${viewerDOMId}-toggleFreeButtonSelector">${moveFreeIcon}</label>`;
  moveFreeButton.addEventListener('change', (event) => {
    let freeButton = document.getElementById(viewerDOMId + '-toggleFreeButtonSelector');
    let check = freeButton.checked;
    untoggleOtherButtons('-toggleFreeButtonSelector', viewerDOMId, tumorWidget, compareWidget);
    if (freeButton.checked === true && freeButton.checked !== check) { //Default button, check if something changed and if it is checked
      tumorWidget.setStateToFree();
      compareWidget.setStateToFree();
    }
  });
  mainUIRow.appendChild(moveFreeButton);

  const moveDepthButton = document.createElement('div');
  moveDepthButton.innerHTML = `<input id="${viewerDOMId}-toggleMoveDepthButton" type="checkbox" class="${
    style.toggleInput
  }"><label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Move selection along depth" class="${
    contrastSensitiveStyle.invertibleButton
  } ${style.moveDepthButton} ${
    style.toggleButton
  }" for="${viewerDOMId}-toggleMoveDepthButton">${moveDepthIcon}</label>`;
  moveDepthButton.addEventListener('change', (event) => {
    // TODO some functionality
    untoggleOtherButtons('-toggleMoveDepthButton', viewerDOMId, tumorWidget, compareWidget);
    if (document.getElementById(viewerDOMId + '-toggleMoveDepthButton').checked === true) {
      tumorWidget.setStateToDepth();
      compareWidget.setStateToDepth();
    }
  });
  mainUIRow.appendChild(moveDepthButton);


  const movePlaneButton = document.createElement('div');
  movePlaneButton.innerHTML = `<input id="${viewerDOMId}-toggleMovePlaneButton" type="checkbox" class="${
    style.toggleInput
  }"><label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Move selection on plane" class="${
    contrastSensitiveStyle.invertibleButton
  } ${style.movePlaneButton} ${
    style.toggleButton
  }" for="${viewerDOMId}-toggleMovePlaneButton">${movePlaneIcon}</label>`;
  movePlaneButton.addEventListener('change', (event) => {
    // TODO some functionality
    untoggleOtherButtons('-toggleMovePlaneButton', viewerDOMId, tumorWidget, compareWidget);
    if (document.getElementById(viewerDOMId + '-toggleMovePlaneButton').checked === true) {
      tumorWidget.setStateToPlane();
      compareWidget.setStateToPlane();
    }
  });
  mainUIRow.appendChild(movePlaneButton);

  /**
   * Mirror option
   */
  const mirrorButton = document.createElement('div');
  mirrorButton.innerHTML = `<input id="${viewerDOMId}-toggleMirrorButton" type="checkbox" class="${
    style.toggleInput
  }"><label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Move selection on plane" class="${
    contrastSensitiveStyle.invertibleButton
  } ${style.mirrorButton} ${
    style.toggleButton
  }" for="${viewerDOMId}-toggleMirrorButton">${mirrorIcon}</label>`;
  mirrorButton.addEventListener('change', (event) => {
    // TODO some functionality
    compareWidget.setMirrorState(document.getElementById(viewerDOMId + '-toggleMirrorButton').checked);
  });
  mainUIRow.appendChild(mirrorButton);

  const snapTumorToSliceButton = document.createElement('div');
  snapTumorToSliceButton.innerHTML = `<div itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Snap tumor picker to slice" class="${
    contrastSensitiveStyle.invertibleButton
  } ${style.tumorSnapButton}">${snapTumorToPlaneIcon}</div>`;
  snapTumorToSliceButton.addEventListener('click', () => {
    tumorWidget.snapToSlice();
  })
  mainUIRow.appendChild(snapTumorToSliceButton);

  const snapCompareToSliceButton = document.createElement('div');
  snapCompareToSliceButton.innerHTML = `<div itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Snap compare picker to slice" class="${
    contrastSensitiveStyle.invertibleButton
  } ${style.compareSnapButton}">${snapCompareToPlaneIcon}</div>`;
  snapCompareToSliceButton.addEventListener('click', () => {
    compareWidget.snapToSlice();
  })
  mainUIRow.appendChild(snapCompareToSliceButton);


  /**
   * Transferfunction showing
   */
  const toggleButton = document.createElement('div');
  toggleButton.innerHTML = `<input id="${viewerDOMId}-toggleTransferFunctionButton" type="checkbox" class="${
    style.toggleInput
  }"><label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Toggle transferfunction" class="${
    contrastSensitiveStyle.invertibleButton
  } ${style.toggleTransferFunctionButton} ${
    style.toggleButton
  }" for="${viewerDOMId}-toggleTransferFunctionButton">${toggleIcon}</label>`;
  toggleButton.addEventListener('change', (event) => {
    const tfF = document.getElementById(viewerDOMId + '-toggleTransferFunction');
    const cm = document.getElementById(viewerDOMId + '-toggleColorMap');
    if (tfF !== null && cm !== null) {
      if (!document.getElementById(viewerDOMId + '-toggleTransferFunctionButton').checked) {
        tfF.style.display = 'none';
        cm.style.display = 'none';
      } else {
        tfF.style.display = 'flex';
        cm.style.display = 'flex';
      }
    }
  });
  mainUIRow.appendChild(toggleButton);


  uiContainer.appendChild(mainUIGroup);
  document.getElementById(viewerDOMId + '-toggleFreeButtonSelector').click();
  document.getElementById(viewerDOMId + '-toggleTransferFunctionButton').click();
  return {tumorWidget, compareWidget};
}

function untoggleOtherButtons(button, viewerDOMId, tumorWidget, compareWidget) {
  let depthButton = document.getElementById(viewerDOMId + '-toggleMoveDepthButton');
  let planeButton = document.getElementById(viewerDOMId + '-toggleMovePlaneButton');
  let freeButton = document.getElementById(viewerDOMId + '-toggleFreeButtonSelector');

  if (button !== '-toggleMoveDepthButton' && depthButton.checked) {
    depthButton.click();
  }
  if (button !== '-toggleMovePlaneButton' && planeButton.checked) {
    planeButton.click();
  }
  if (button !== '-toggleFreeButtonSelector' && freeButton.checked) {
    freeButton.click();
  }

  if (!depthButton.checked && !planeButton.checked && !freeButton.checked) {
    freeButton.checked = true;
    tumorWidget.setStateToFree();
    compareWidget.setStateToFree();
  }
}


export default createSelectionWidgetUI;
