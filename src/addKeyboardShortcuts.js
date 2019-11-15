import Mousetrap from 'mousetrap';
import preventDefaults from './userInterface/preventDefaults';

const MOUSETRAP = new Mousetrap();

const addKeyboardShortcuts = (container, viewer, viewerDOMId, tumorWidget, compareWidget, simiCallback) => {

  container.addEventListener('mouseenter', () => {
    MOUSETRAP.bind('1', function (event, combo) {
      preventDefaults(event);
      viewer.setViewMode('XPlane');
    })
    MOUSETRAP.bind('alt+1', function (event, combo) {
      preventDefaults(event);
      viewer.setViewMode('XPlane');
    })
    MOUSETRAP.bind('2', function (event, combo) {
      preventDefaults(event);
      viewer.setViewMode('YPlane');
    })
    MOUSETRAP.bind('alt+2', function (event, combo) {
      preventDefaults(event);
      viewer.setViewMode('YPlane');
    })
    MOUSETRAP.bind('3', function (event, combo) {
      preventDefaults(event);
      viewer.setViewMode('ZPlane');
    })
    MOUSETRAP.bind('alt+3', function (event, combo) {
      preventDefaults(event);
      viewer.setViewMode('ZPlane');
    })
    MOUSETRAP.bind('4', function (event, combo) {
      preventDefaults(event);
      viewer.setViewMode('VolumeRendering');
    })
    MOUSETRAP.bind('alt+4', function (event, combo) {
      preventDefaults(event);
      viewer.setViewMode('VolumeRendering');
    })
    MOUSETRAP.bind('r', function (event, combo) {
      preventDefaults(event);
      viewer.getViewProxy().resetCamera();
    })
    MOUSETRAP.bind('alt+r', function (event, combo) {
      preventDefaults(event);
      viewer.getViewProxy().resetCamera();
    })
    MOUSETRAP.bind('p', function (event, combo) {
      preventDefaults(event);
      viewer.getViewProxy().resetCamera();
    })
    MOUSETRAP.bind('alt+p', function (event, combo) {
      preventDefaults(event);
      viewer.getViewProxy().resetCamera();
    })
    MOUSETRAP.bind('e', function (event, combo) {
      preventDefaults(event);
      const resetCroppingPlanesButton = document.getElementById(`${viewerDOMId}-resetCroppingPlanesButton`);
      resetCroppingPlanesButton.click();
    })
    MOUSETRAP.bind('alt+e', function (event, combo) {
      preventDefaults(event);
      const resetCroppingPlanesButton = document.getElementById(`${viewerDOMId}-resetCroppingPlanesButton`);
      resetCroppingPlanesButton.click();
    })
    MOUSETRAP.bind('.', function (event, combo) {
      preventDefaults(event);
      const resetCroppingPlanesButton = document.getElementById(`${viewerDOMId}-resetCroppingPlanesButton`);
      resetCroppingPlanesButton.click();
    })
    MOUSETRAP.bind('alt+.', function (event, combo) {
      preventDefaults(event);
      const resetCroppingPlanesButton = document.getElementById(`${viewerDOMId}-resetCroppingPlanesButton`);
      resetCroppingPlanesButton.click();
    })
    MOUSETRAP.bind('w', function (event, combo) {
      preventDefaults(event);
      const toggleCroppingPlanesButton = document.getElementById(`${viewerDOMId}-toggleCroppingPlanesButton`);
      toggleCroppingPlanesButton.click();
    })
    MOUSETRAP.bind('alt+w', function (event, combo) {
      preventDefaults(event);
      const toggleCroppingPlanesButton = document.getElementById(`${viewerDOMId}-toggleCroppingPlanesButton`);
      toggleCroppingPlanesButton.click();
    })
    MOUSETRAP.bind(',', function (event, combo) {
      preventDefaults(event);
      const toggleCroppingPlanesButton = document.getElementById(`${viewerDOMId}-toggleCroppingPlanesButton`);
      toggleCroppingPlanesButton.click();
    })
    MOUSETRAP.bind('alt+,', function (event, combo) {
      preventDefaults(event);
      const toggleCroppingPlanesButton = document.getElementById(`${viewerDOMId}-toggleCroppingPlanesButton`);
      toggleCroppingPlanesButton.click();
    })
    MOUSETRAP.bind("'", function (event, combo) {
      preventDefaults(event);
      const toggleUserInterfaceButton = document.getElementById(`${viewerDOMId}-toggleUserInterfaceButton`);
      toggleUserInterfaceButton.click();
    })
    MOUSETRAP.bind("alt+'", function (event, combo) {
      preventDefaults(event);
      const toggleUserInterfaceButton = document.getElementById(`${viewerDOMId}-toggleUserInterfaceButton`);
      toggleUserInterfaceButton.click();
    })
    MOUSETRAP.bind('q', function (event, combo) {
      preventDefaults(event);
      const toggleUserInterfaceButton = document.getElementById(`${viewerDOMId}-toggleUserInterfaceButton`);
      toggleUserInterfaceButton.click();
    })
    MOUSETRAP.bind('alt+q', function (event, combo) {
      preventDefaults(event);
      const toggleUserInterfaceButton = document.getElementById(`${viewerDOMId}-toggleUserInterfaceButton`);
      toggleUserInterfaceButton.click();
    })
    MOUSETRAP.bind('f', function (event, combo) {
      preventDefaults(event);
      const toggleFullscreenButton = document.getElementById(`${viewerDOMId}-toggleFullscreenButton`);
      toggleFullscreenButton.click();
    })
    MOUSETRAP.bind('alt+f', function (event, combo) {
      preventDefaults(event);
      const toggleFullscreenButton = document.getElementById(`${viewerDOMId}-toggleFullscreenButton`);
      toggleFullscreenButton.click();
    })
    MOUSETRAP.bind('u', function (event, combo) {
      preventDefaults(event);
      const toggleFullscreenButton = document.getElementById(`${viewerDOMId}-toggleFullscreenButton`);
      toggleFullscreenButton.click();
    })
    MOUSETRAP.bind('alt+u', function (event, combo) {
      preventDefaults(event);
      const toggleFullscreenButton = document.getElementById(`${viewerDOMId}-toggleFullscreenButton`);
      toggleFullscreenButton.click();
    })
    MOUSETRAP.bind('s', function (event, combo) {
      preventDefaults(event);
      const toggleSlicingPlanesButton = document.getElementById(`${viewerDOMId}-toggleSlicingPlanesButton`);
      toggleSlicingPlanesButton.click();
    })
    MOUSETRAP.bind('alt+s', function (event, combo) {
      preventDefaults(event);
      const toggleSlicingPlanesButton = document.getElementById(`${viewerDOMId}-toggleSlicingPlanesButton`);
      toggleSlicingPlanesButton.click();
    })
    MOUSETRAP.bind('o', function (event, combo) {
      preventDefaults(event);
      const toggleSlicingPlanesButton = document.getElementById(`${viewerDOMId}-toggleSlicingPlanesButton`);
      toggleSlicingPlanesButton.click();
    })
    MOUSETRAP.bind('alt+o', function (event, combo) {
      preventDefaults(event);
      const toggleSlicingPlanesButton = document.getElementById(`${viewerDOMId}-toggleSlicingPlanesButton`);
      toggleSlicingPlanesButton.click();
    })


    MOUSETRAP.bind('shift', function (event, combo) {
      preventDefaults(event);
      document.getElementById(viewerDOMId + '-toggleMovePlaneButton').click();
    })

    MOUSETRAP.bind('ctrl', function (event, combo) {
      preventDefaults(event);
      document.getElementById(viewerDOMId + '-toggleMoveDepthButton').click();
    })

    MOUSETRAP.bind('m', function (event, combo) {
      preventDefaults(event);
      document.getElementById(viewerDOMId + '-toggleMirrorButton').click();
    })

    MOUSETRAP.bind('t', function (event, combo) {
      preventDefaults(event);
      tumorWidget.snapToSlice();
    });

    MOUSETRAP.bind('alt+t', function (event, combo) {
      preventDefaults(event);
      document.getElementById(viewerDOMId + '-toggleTumorSelector').click();
    });

    MOUSETRAP.bind('c', function (event, combo) {
      preventDefaults(event);
      compareWidget.snapToSlice();
    });

    MOUSETRAP.bind('alt+c', function (event, combo) {
      preventDefaults(event);
      document.getElementById(viewerDOMId + '-toggleControlSelector').click();
    });

    MOUSETRAP.bind('x', function (event, combo) {
      preventDefaults(event);
      document.getElementById(viewerDOMId + '-toggleTransferFunctionButton').click();
    });

    MOUSETRAP.bind('y', function (event, combo) {
      preventDefaults(event);
      if (simiCallback !== null && simiCallback !== undefined) {
        simiCallback();
      }
    });
  });

  MOUSETRAP.stopCallback = function () {
    return false;
  }

  container.addEventListener('mouseleave', () => {
    MOUSETRAP.reset();
  });

}

export default addKeyboardShortcuts;
