import macro from 'vtk.js/Sources/macro';
import vtkImageCroppingRegionsWidget from 'vtk.js/Sources/Interaction/Widgets/ImageCroppingRegionsWidget';
import vtkTumorSelectWidget from './widget/SelectionWidget';

import getContrastSensitiveStyle from './getContrastSensitiveStyle';

import style from './MriAnalyzer.module.css';

import toggleIcon from './icons/toggle.svg';
import screenshotIcon from './icons/screenshot.svg';
import volumeRenderingIcon from './icons/volume-rendering.svg';
import xPlaneIcon from './icons/x-plane.svg';
import yPlaneIcon from './icons/y-plane.svg';
import zPlaneIcon from './icons/z-plane.svg';
import annotationIcon from './icons/annotations.svg';
import fullscreenIcon from './icons/fullscreen.svg';
import interpolationIcon from './icons/interpolation.svg';
import cropIcon from './icons/crop.svg';
import resetCropIcon from './icons/reset-crop.svg';
import resetCameraIcon from './icons/reset-camera.svg';
import tumorIcon from './icons/tumor.svg';
import controlIcon from './icons/control.svg';

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
  isPct = isPct === true;

  if (h.length === 4) {
    r = '0x' + h[1] + h[1];
    g = '0x' + h[2] + h[2];
    b = '0x' + h[3] + h[3];

  } else if (h.length === 7) {
    r = '0x' + h[1] + h[2];
    g = '0x' + h[3] + h[4];
    b = '0x' + h[5] + h[6];
  }

  if (isPct) {
    r = +(r / 255 * 100).toFixed(1);
    g = +(g / 255 * 100).toFixed(1);
    b = +(b / 255 * 100).toFixed(1);
  }

  return [r / 100, g / 100, b / 100];
}


function createMainUI(
  rootContainer,
  viewerDOMId,
  isBackgroundDark,
  use2D,
  imageSource,
  imageRepresentation,
  view,
  tumorHandle,
  compareHandle,
  sliceSelectionHandle,
  boundingBoxHandle,
  colors
) {
  const uiContainer = document.createElement('div');
  rootContainer.appendChild(uiContainer);
  uiContainer.setAttribute('class', style.uiContainer);

  if (colors === null || colors === undefined) {
    colors = {
      tumor: [0.8157, 0.2392, 0.215686],
      compare: [0, 0.647, 0.098]
    };
  } else {
    colors = {
      tumor: hexToRGB(colors.tumor, true),
      compare: hexToRGB(colors.compare, true)
    };
  }

  console.log(colors);

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

  const toggleUserInterfaceButton = document.createElement('div');

  function toggleUIVisibility() {
    const elements = uiContainer.querySelectorAll(`.${viewerDOMId}-toggle`);
    let count = elements.length;
    const collapsed = toggleUserInterfaceButton.getAttribute('collapsed') === 'true';
    if (collapsed) {
      while (count--) {
        elements[count].style.display = 'flex';
      }
      toggleUserInterfaceButton.removeAttribute('collapsed');
    } else {
      while (count--) {
        elements[count].style.display = 'none';
      }
      toggleUserInterfaceButton.setAttribute('collapsed', 'true');
    }
  }

  toggleUserInterfaceButton.className = `${
    contrastSensitiveStyle.invertibleButton
    } ${style.toggleUserInterfaceButton}`;
  toggleUserInterfaceButton.id = `${viewerDOMId}-toggleUserInterfaceButton`;
  toggleUserInterfaceButton.innerHTML = `${toggleIcon}`;
  toggleUserInterfaceButton.addEventListener('click', toggleUIVisibility);
  uiContainer.appendChild(toggleUserInterfaceButton);

  const screenshotButton = document.createElement('div');
  screenshotButton.innerHTML = `<div itk-vtk-tooltip itk-vtk-tooltip-top-screenshot itk-vtk-tooltip-content="Screenshot" class="${
    contrastSensitiveStyle.invertibleButton
    } ${style.screenshotButton}">${screenshotIcon}</div>`;

  function takeScreenshot() {
    view.openCaptureImage();
  }

  screenshotButton.addEventListener('click', takeScreenshot);
  mainUIRow.appendChild(screenshotButton);

  const body = document.querySelector('body');
  let fullScreenMethods = null;
  // https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
  [
    ['requestFullscreen', 'exitFullscreen', 'fullscreenchange', 'fullscreen'],
    ['mozRequestFullScreen', 'mozCancelFullScreen', 'mozfullscreenchange', 'mozFullScreen'],
    ['msRequestFullscreen', 'msExitFullscreen', 'MSFullscreenChange', 'msFullscreenEnabled'],
    ['webkitRequestFullscreen', 'webkitExitFullscreen', 'webkitfullscreenchange', 'webkitIsFullScreen']
  ].forEach((methods) => {
    if (body[methods[0]] && !fullScreenMethods) {
      fullScreenMethods = methods;
    }
  });

  if (fullScreenMethods) {
    const fullscreenButton = document.createElement('div');
    fullscreenButton.innerHTML = `<input id="${viewerDOMId}-toggleFullscreenButton" type="checkbox" class="${
      style.toggleInput
      }"><label itk-vtk-tooltip itk-vtk-tooltip-top-annotation itk-vtk-tooltip-content="Fullscreen[f]" class="${
      contrastSensitiveStyle.invertibleButton
      } ${style.fullscreenButton} ${
      style.toggleButton
      }" for="${viewerDOMId}-toggleFullscreenButton">${fullscreenIcon}</label>`;
    const fullscreenButtonInput = fullscreenButton.children[0];
    const container = rootContainer.children[0];
    const oldWidth = container.style.width;
    const oldHeight = container.style.height;

    function toggleFullscreen() {
      const fullscreenEnabled = fullscreenButtonInput.checked;
      if (fullscreenEnabled) {
        container.style.width = '100vw';
        container.style.height = '100vh';
        rootContainer[fullScreenMethods[0]]();
      } else {
        container.style.width = oldWidth;
        container.style.height = oldHeight;
        document[fullScreenMethods[1]]();
      }
    }

    fullscreenButton.addEventListener('change', (event) => {
      toggleFullscreen();
    });
    document.addEventListener(fullScreenMethods[2], (event) => {
      if (!document[fullScreenMethods[3]]) {
        container.style.width = oldWidth;
        container.style.height = oldHeight;
        fullscreenButtonInput.checked = false;
      }
    });
    mainUIRow.appendChild(fullscreenButton);
  }


  const annotationButton = document.createElement('div');
  annotationButton.innerHTML = `<input id="${viewerDOMId}-toggleAnnotationsButton" type="checkbox" class="${
    style.toggleInput
    }" checked><label itk-vtk-tooltip itk-vtk-tooltip-top-annotation itk-vtk-tooltip-content="Annotations" class="${
    contrastSensitiveStyle.invertibleButton
    } ${style.annotationButton} ${
    style.toggleButton
    }" for="${viewerDOMId}-toggleAnnotationsButton">${annotationIcon}</label>`;
  const annotationButtonInput = annotationButton.children[0];

  function toggleAnnotations() {
    const annotationEnabled = annotationButtonInput.checked;
    view.setOrientationAnnotationVisibility(annotationEnabled);
  }

  annotationButton.addEventListener('change', (event) => {
    toggleAnnotations();
  });
  mainUIRow.appendChild(annotationButton);

  if (imageRepresentation) {
    let interpolationEnabled = true;

    function toggleInterpolation() {
      interpolationEnabled = !interpolationEnabled;
      view.setPlanesUseLinearInterpolation(interpolationEnabled);
    }

    const interpolationButton = document.createElement('div');
    interpolationButton.innerHTML = `<input id="${viewerDOMId}-toggleInterpolationButton" type="checkbox" class="${
      style.toggleInput
      }" checked><label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Interpolation" class="${
      contrastSensitiveStyle.invertibleButton
      } ${style.interpolationButton} ${
      style.toggleButton
      }" for="${viewerDOMId}-toggleInterpolationButton">${interpolationIcon}</label>`;
    interpolationButton.addEventListener('change', (event) => {
      toggleInterpolation();
    });
    mainUIRow.appendChild(interpolationButton);
  }

  function setViewModeXPlane() {
    view.setViewMode('XPlane');
    document.getElementById(`${viewerDOMId}-xPlaneButton`).checked = true;
    document.getElementById(`${viewerDOMId}-yPlaneButton`).checked = false;
    document.getElementById(`${viewerDOMId}-zPlaneButton`).checked = false;
    document.getElementById(
      `${viewerDOMId}-volumeRenderingButton`
    ).checked = false;
    if (imageRepresentation) {
      const volumeRenderingRow = uiContainer.querySelector(
        `.${viewerDOMId}-volumeRendering`
      );
      volumeRenderingRow.style.display = 'none';
      const xPlaneRow = uiContainer.querySelector(`.${viewerDOMId}-x-plane-row`);
      xPlaneRow.style.display = 'flex';
      const yPlaneRow = uiContainer.querySelector(`.${viewerDOMId}-y-plane-row`);
      yPlaneRow.style.display = 'none';
      const zPlaneRow = uiContainer.querySelector(`.${viewerDOMId}-z-plane-row`);
      zPlaneRow.style.display = 'none';
      if (sliceSelectionHandle != null) {
        // sliceSelectionHandle('x', document.getElementById(`${viewerDOMId}-xSlice`).value);
      }
    }
  }

  function setViewModeYPlane() {
    view.setViewMode('YPlane');
    document.getElementById(`${viewerDOMId}-xPlaneButton`).checked = false;
    document.getElementById(`${viewerDOMId}-yPlaneButton`).checked = true;
    document.getElementById(`${viewerDOMId}-zPlaneButton`).checked = false;
    document.getElementById(
      `${viewerDOMId}-volumeRenderingButton`
    ).checked = false;
    if (imageRepresentation) {
      const volumeRenderingRow = uiContainer.querySelector(
        `.${viewerDOMId}-volumeRendering`
      );
      volumeRenderingRow.style.display = 'none';
      const xPlaneRow = uiContainer.querySelector(`.${viewerDOMId}-x-plane-row`);
      xPlaneRow.style.display = 'none';
      const yPlaneRow = uiContainer.querySelector(`.${viewerDOMId}-y-plane-row`);
      yPlaneRow.style.display = 'flex';
      const zPlaneRow = uiContainer.querySelector(`.${viewerDOMId}-z-plane-row`);
      zPlaneRow.style.display = 'none';
      if (sliceSelectionHandle != null) {
        // sliceSelectionHandle('y', document.getElementById(`${viewerDOMId}-ySlice`).value);
      }
    }
  }

  function setViewModeZPlane() {
    view.setViewMode('ZPlane');
    document.getElementById(`${viewerDOMId}-xPlaneButton`).checked = false;
    document.getElementById(`${viewerDOMId}-yPlaneButton`).checked = false;
    document.getElementById(`${viewerDOMId}-zPlaneButton`).checked = true;
    document.getElementById(
      `${viewerDOMId}-volumeRenderingButton`
    ).checked = false;
    if (imageRepresentation) {
      const volumeRenderingRow = uiContainer.querySelector(
        `.${viewerDOMId}-volumeRendering`
      );
      volumeRenderingRow.style.display = 'none';
      const xPlaneRow = uiContainer.querySelector(`.${viewerDOMId}-x-plane-row`);
      xPlaneRow.style.display = 'none';
      const yPlaneRow = uiContainer.querySelector(`.${viewerDOMId}-y-plane-row`);
      yPlaneRow.style.display = 'none';
      const zPlaneRow = uiContainer.querySelector(`.${viewerDOMId}-z-plane-row`);
      zPlaneRow.style.display = 'flex';
      if (sliceSelectionHandle != null) {
        // sliceSelectionHandle('z', document.getElementById(`${viewerDOMId}-zSlice`).value);
      }
    }
  }

  function setViewModeVolumeRendering() {
    view.setViewMode('VolumeRendering');
    document.getElementById(`${viewerDOMId}-xPlaneButton`).checked = false;
    document.getElementById(`${viewerDOMId}-yPlaneButton`).checked = false;
    document.getElementById(`${viewerDOMId}-zPlaneButton`).checked = false;
    document.getElementById(
      `${viewerDOMId}-volumeRenderingButton`
    ).checked = true;
    if (imageRepresentation) {
      const volumeRenderingRow = uiContainer.querySelector(
        `.${viewerDOMId}-volumeRendering`
      );
      volumeRenderingRow.style.display = 'flex';
      const viewPlanes = document.getElementById(
        `${viewerDOMId}-toggleSlicingPlanesButton`
      ).checked;
      const xPlaneRow = uiContainer.querySelector(`.${viewerDOMId}-x-plane-row`);
      const yPlaneRow = uiContainer.querySelector(`.${viewerDOMId}-y-plane-row`);
      const zPlaneRow = uiContainer.querySelector(`.${viewerDOMId}-z-plane-row`);
      if (viewPlanes) {
        xPlaneRow.style.display = 'flex';
        yPlaneRow.style.display = 'flex';
        zPlaneRow.style.display = 'flex';
      } else {
        xPlaneRow.style.display = 'none';
        yPlaneRow.style.display = 'none';
        zPlaneRow.style.display = 'none';
      }
    }
  }

  if (!use2D) {
    const xPlaneButton = document.createElement('div');
    xPlaneButton.innerHTML = `<input id="${viewerDOMId}-xPlaneButton" type="checkbox" class="${
      style.toggleInput
      }"><label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="X plane [1]" class="${
      contrastSensitiveStyle.tooltipButton
      } ${style.viewModeButton} ${
      style.toggleButton
      }" for="${viewerDOMId}-xPlaneButton">${xPlaneIcon}</label>`;
    xPlaneButton.addEventListener('click', setViewModeXPlane);
    mainUIRow.appendChild(xPlaneButton);

    const yPlaneButton = document.createElement('div');
    yPlaneButton.innerHTML = `<input id="${viewerDOMId}-yPlaneButton" type="checkbox" class="${
      style.toggleInput
      }"><label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Y plane [2]" class="${
      contrastSensitiveStyle.tooltipButton
      } ${style.viewModeButton} ${
      style.toggleButton
      }" for="${viewerDOMId}-yPlaneButton">${yPlaneIcon}</label>`;
    yPlaneButton.addEventListener('click', setViewModeYPlane);
    mainUIRow.appendChild(yPlaneButton);

    const zPlaneButton = document.createElement('div');
    zPlaneButton.innerHTML = `<input id="${viewerDOMId}-zPlaneButton" type="checkbox" class="${
      style.toggleInput
      }"><label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Z plane [3]" class="${
      contrastSensitiveStyle.tooltipButton
      } ${style.viewModeButton} ${
      style.toggleButton
      }" for="${viewerDOMId}-zPlaneButton">${zPlaneIcon}</label>`;
    zPlaneButton.addEventListener('click', setViewModeZPlane);
    mainUIRow.appendChild(zPlaneButton);

    const volumeRenderingButton = document.createElement('div');
    volumeRenderingButton.innerHTML = `<input id="${viewerDOMId}-volumeRenderingButton" type="checkbox" class="${
      style.toggleInput
      }" checked><label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Volume [4]" class="${
      contrastSensitiveStyle.tooltipButton
      } ${style.viewModeButton} ${
      style.toggleButton
      }" for="${viewerDOMId}-volumeRenderingButton">${volumeRenderingIcon}</label>`;
    volumeRenderingButton.addEventListener('click', setViewModeVolumeRendering);
    mainUIRow.appendChild(volumeRenderingButton);
  }

  let croppingWidget = null;
  let addCroppingPlanesChangedHandler = () => {
  };
  let addResetCropHandler = () => {
  };
  if (imageRepresentation) {
    croppingWidget = vtkImageCroppingRegionsWidget.newInstance();
    croppingWidget.setHandleSize(22);
    croppingWidget.setFaceHandlesEnabled(false);
    croppingWidget.setEdgeHandlesEnabled(false);
    croppingWidget.setCornerHandlesEnabled(true);
    croppingWidget.setInteractor(view.getInteractor());
    croppingWidget.setEnabled(false);
    croppingWidget.setVolumeMapper(imageRepresentation.getMapper());
    const croppingPlanesChangedHandlers = [];
    addCroppingPlanesChangedHandler = (handler) => {
      const index = croppingPlanesChangedHandlers.length;
      croppingPlanesChangedHandlers.push(handler);

      function unsubscribe() {
        croppingPlanesChangedHandlers[index] = null;
      }

      return Object.freeze({ unsubscribe });
    };
    let croppingUpdateInProgress = false;
    const setCroppingPlanes = () => {
      if (croppingUpdateInProgress) {
        return;
      }
      croppingUpdateInProgress = true;
      const planes = croppingWidget.getWidgetState().planes;
      imageRepresentation.setCroppingPlanes(planes);
      const bboxCorners = croppingWidget.planesToBBoxCorners(planes);
      // console.log(bboxCorners);
      if (boundingBoxHandle != null) {
        boundingBoxHandle(bboxCorners);
      }
      croppingPlanesChangedHandlers.forEach((handler) => {
        handler.call(null, planes, bboxCorners);
      });
      croppingUpdateInProgress = false;
    };
    const debouncedSetCroppingPlanes = macro.debounce(setCroppingPlanes, 100);
    croppingWidget.onCroppingPlanesChanged(debouncedSetCroppingPlanes);
    let cropEnabled = false;

    function toggleCrop() {
      cropEnabled = !cropEnabled;
      croppingWidget.setEnabled(cropEnabled);
    }

    const cropButton = document.createElement('div');
    cropButton.innerHTML = `<input id="${viewerDOMId}-toggleCroppingPlanesButton" type="checkbox" class="${
      style.toggleInput
      }"><label itk-vtk-tooltip itk-vtk-tooltip-bottom itk-vtk-tooltip-content="Select ROI [w]" class="${
      contrastSensitiveStyle.invertibleButton
      } ${style.cropButton} ${
      style.toggleButton
      }" for="${viewerDOMId}-toggleCroppingPlanesButton">${cropIcon}</label>`;
    cropButton.addEventListener('change', (event) => {
      toggleCrop();
    });
    mainUIRow.appendChild(cropButton);

    const resetCropButton = document.createElement('div');
    resetCropButton.innerHTML = `<input id="${viewerDOMId}-resetCroppingPlanesButton" type="checkbox" class="${
      style.toggleInput
      }" checked><label itk-vtk-tooltip itk-vtk-tooltip-bottom itk-vtk-tooltip-content="Reset ROI [e]" class="${
      contrastSensitiveStyle.invertibleButton
      } ${style.resetCropButton} ${
      style.toggleButton
      }" for="${viewerDOMId}-resetCroppingPlanesButton">${resetCropIcon}</label>`;
    const resetCropHandlers = [];
    addResetCropHandler = (handler) => {
      const index = resetCropHandlers.length;
      resetCropHandlers.push(handler);

      function unsubscribe() {
        resetCropHandlers[index] = null;
      }

      return Object.freeze({ unsubscribe });
    };

    function resetCrop() {
      imageRepresentation.getCropFilter()
        .reset();
      croppingWidget.resetWidgetState();
      resetCropHandlers.forEach((handler) => {
        handler.call(null);
      });
    }

    resetCropButton.addEventListener('change', (event) => {
      event.preventDefault();
      event.stopPropagation();
      resetCrop();
    });
    resetCropButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      resetCrop();
    });
    mainUIRow.appendChild(resetCropButton);
  } // if(imageRepresentation)

  const resetCameraButton = document.createElement('div');
  resetCameraButton.innerHTML = `<input id="${viewerDOMId}-resetCameraButton" type="checkbox" class="${
    style.toggleInput
    }" checked><label itk-vtk-tooltip itk-vtk-tooltip-bottom itk-vtk-tooltip-content="Reset camera [r]" class="${
    contrastSensitiveStyle.invertibleButton
    } ${style.resetCameraButton} ${
    style.toggleButton
    }" for="${viewerDOMId}-resetCameraButton">${resetCameraIcon}</label>`;

  function resetCamera() {
    view.resetCamera();
  }

  resetCameraButton.addEventListener('change', (event) => {
    event.preventDefault();
    event.stopPropagation();
    resetCamera();
  });
  resetCameraButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    resetCamera();
  });
  mainUIRow.appendChild(resetCameraButton);

  /**
   * Add tumor selector button
   */
  if (colors !== undefined) console.log('Tumor color:' + hexToRGB(colors.tumor));
  const tumorWidget = vtkTumorSelectWidget.newInstance();
  tumorWidget.setHandleSize(5);
  tumorWidget.setColorBasic(colors.tumor);
  tumorWidget.setColorSelect(colors.tumor);
  tumorWidget.setSelectionHandle(tumorHandle);
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
    }"><label itk-vtk-tooltip itk-vtk-tooltip-bottom itk-vtk-tooltip-content="Select Tumor" class="${
    contrastSensitiveStyle.invertibleButton
    } ${style.tumorButton} ${
    style.toggleButton
    }" for="${viewerDOMId}-toggleTumorSelector">${tumorIcon}</label>`;
  tumorButton.addEventListener('change', (event) => {
    toggleTumorSelection();
  });
  mainUIRow.appendChild(tumorButton);

  /**
   * Add compare region selector button
   */
  if (colors !== undefined) console.log('Compare color:' + hexToRGB(colors.compare));
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
    }"><label itk-vtk-tooltip itk-vtk-tooltip-bottom itk-vtk-tooltip-content="Select Control area" class="${
    contrastSensitiveStyle.invertibleButton
    } ${style.compareButton} ${
    style.toggleButton
    }" for="${viewerDOMId}-toggleControlSelector">${controlIcon}</label>`;
  compareButton.addEventListener('change', (event) => {
    toggleControlSelection();
  });
  mainUIRow.appendChild(compareButton);

  uiContainer.appendChild(mainUIGroup);


  return {
    uiContainer,
    croppingWidget,
    addCroppingPlanesChangedHandler,
    addResetCropHandler
  };
}

export default createMainUI;
