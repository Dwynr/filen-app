"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dom = require("@testing-library/dom");

function wait(time) {
  return new Promise(function (resolve) {
    setTimeout(() => resolve(), time);
  });
}

function findTagInParents(element, tagName) {
  if (element.parentNode == null) return undefined;
  if (element.parentNode.tagName === tagName) return element.parentNode;
  return findTagInParents(element.parentNode, tagName);
}

function clickLabel(label) {
  _dom.fireEvent.mouseOver(label);

  _dom.fireEvent.mouseMove(label);

  _dom.fireEvent.mouseDown(label);

  _dom.fireEvent.mouseUp(label);

  if (label.htmlFor) {
    const input = document.getElementById(label.htmlFor);
    input.focus();

    _dom.fireEvent.click(label);
  } else {
    const input = label.querySelector("input,textarea,select");
    input.focus();
    label.focus();

    _dom.fireEvent.click(label);
  }
}

function clickBooleanElement(element) {
  if (element.disabled) return;

  _dom.fireEvent.mouseOver(element);

  _dom.fireEvent.mouseMove(element);

  _dom.fireEvent.mouseDown(element);

  _dom.fireEvent.focus(element);

  _dom.fireEvent.mouseUp(element);

  _dom.fireEvent.click(element);
}

function clickElement(element, previousElement) {
  _dom.fireEvent.mouseOver(element);

  _dom.fireEvent.mouseMove(element);

  const continueDefaultHandling = _dom.fireEvent.mouseDown(element);

  if (continueDefaultHandling) {
    previousElement && previousElement.blur();
    element.focus();
  }

  _dom.fireEvent.mouseUp(element);

  _dom.fireEvent.click(element);

  const labelAncestor = findTagInParents(element, "LABEL");
  labelAncestor && clickLabel(labelAncestor);
}

function dblClickElement(element, previousElement) {
  _dom.fireEvent.mouseOver(element);

  _dom.fireEvent.mouseMove(element);

  const continueDefaultHandling = _dom.fireEvent.mouseDown(element);

  if (continueDefaultHandling) {
    previousElement && previousElement.blur();
    element.focus();
  }

  _dom.fireEvent.mouseUp(element);

  _dom.fireEvent.click(element);

  _dom.fireEvent.mouseDown(element);

  _dom.fireEvent.mouseUp(element);

  _dom.fireEvent.click(element);

  _dom.fireEvent.dblClick(element);

  const labelAncestor = findTagInParents(element, "LABEL");
  labelAncestor && clickLabel(labelAncestor);
}

function dblClickCheckbox(checkbox) {
  _dom.fireEvent.mouseOver(checkbox);

  _dom.fireEvent.mouseMove(checkbox);

  _dom.fireEvent.mouseDown(checkbox);

  _dom.fireEvent.focus(checkbox);

  _dom.fireEvent.mouseUp(checkbox);

  _dom.fireEvent.click(checkbox);

  _dom.fireEvent.mouseDown(checkbox);

  _dom.fireEvent.mouseUp(checkbox);

  _dom.fireEvent.click(checkbox);
}

function selectOption(select, option) {
  _dom.fireEvent.mouseOver(option);

  _dom.fireEvent.mouseMove(option);

  _dom.fireEvent.mouseDown(option);

  _dom.fireEvent.focus(option);

  _dom.fireEvent.mouseUp(option);

  _dom.fireEvent.click(option);

  option.selected = true;

  _dom.fireEvent.change(select);
}

function fireChangeEvent(event) {
  _dom.fireEvent.change(event.target);

  event.target.removeEventListener("blur", fireChangeEvent);
}

const userEvent = {
  click(element) {
    const focusedElement = element.ownerDocument.activeElement;
    const wasAnotherElementFocused = focusedElement !== element.ownerDocument.body && focusedElement !== element;

    if (wasAnotherElementFocused) {
      _dom.fireEvent.mouseMove(focusedElement);

      _dom.fireEvent.mouseLeave(focusedElement);
    }

    switch (element.tagName) {
      case "LABEL":
        clickLabel(element);
        break;

      case "INPUT":
        if (element.type === "checkbox" || element.type === "radio") {
          clickBooleanElement(element);
          break;
        }

      default:
        clickElement(element, wasAnotherElementFocused && focusedElement);
    }
  },

  dblClick(element) {
    const focusedElement = document.activeElement;
    const wasAnotherElementFocused = focusedElement !== document.body && focusedElement !== element;

    if (wasAnotherElementFocused) {
      _dom.fireEvent.mouseMove(focusedElement);

      _dom.fireEvent.mouseLeave(focusedElement);
    }

    switch (element.tagName) {
      case "INPUT":
        if (element.type === "checkbox") {
          dblClickCheckbox(element, wasAnotherElementFocused && focusedElement);
          break;
        }

      default:
        dblClickElement(element, wasAnotherElementFocused && focusedElement);
    }
  },

  selectOptions(element, values) {
    const focusedElement = document.activeElement;
    const wasAnotherElementFocused = focusedElement !== document.body && focusedElement !== element;

    if (wasAnotherElementFocused) {
      _dom.fireEvent.mouseMove(focusedElement);

      _dom.fireEvent.mouseLeave(focusedElement);
    }

    clickElement(element, wasAnotherElementFocused && focusedElement);
    const valArray = Array.isArray(values) ? values : [values];
    const selectedOptions = Array.from(element.querySelectorAll("option")).filter(opt => valArray.includes(opt.value));

    if (selectedOptions.length > 0) {
      if (element.multiple) {
        selectedOptions.forEach(option => selectOption(element, option));
      } else {
        selectOption(element, selectedOptions[0]);
      }
    }
  },

  async type(element, text, userOpts = {}) {
    if (element.disabled) return;
    const defaultOpts = {
      allAtOnce: false,
      delay: 0
    };
    const opts = Object.assign(defaultOpts, userOpts);
    const computedText = text.slice(0, element.maxLength || text.length);

    if (opts.allAtOnce) {
      if (element.readOnly) return;

      _dom.fireEvent.input(element, {
        target: {
          value: computedText
        }
      });
    } else {
      let actuallyTyped = "";

      for (let index = 0; index < text.length; index++) {
        const char = text[index];
        const key = char; // TODO: check if this also valid for characters with diacritic markers e.g. úé etc

        const keyCode = char.charCodeAt(0);
        if (opts.delay > 0) await wait(opts.delay);

        const downEvent = _dom.fireEvent.keyDown(element, {
          key: key,
          keyCode: keyCode,
          which: keyCode
        });

        if (downEvent) {
          const pressEvent = _dom.fireEvent.keyPress(element, {
            key: key,
            keyCode,
            charCode: keyCode
          });

          const isTextPastThreshold = (actuallyTyped + key).length > computedText.length;

          if (pressEvent && !isTextPastThreshold) {
            actuallyTyped += key;
            if (!element.readOnly) _dom.fireEvent.input(element, {
              target: {
                value: actuallyTyped
              },
              bubbles: true,
              cancelable: true
            });
          }
        }

        _dom.fireEvent.keyUp(element, {
          key: key,
          keyCode: keyCode,
          which: keyCode
        });
      }
    }

    element.addEventListener("blur", fireChangeEvent);
  },

  tab({
    shift = false,
    focusTrap = document
  } = {}) {
    const focusableElements = focusTrap.querySelectorAll("input, button, select, textarea, a[href], [tabindex]");
    let list = Array.prototype.filter.call(focusableElements, function (item) {
      return item.getAttribute("tabindex") !== "-1" && !item.disabled;
    }).map((el, idx) => ({
      el,
      idx
    })).sort((a, b) => {
      const tabIndexA = a.el.getAttribute("tabindex");
      const tabIndexB = b.el.getAttribute("tabindex");
      const diff = tabIndexA - tabIndexB;
      return diff !== 0 ? diff : a.idx - b.idx;
    });
    const index = list.findIndex(({
      el
    }) => el === document.activeElement);
    let nextIndex = shift ? index - 1 : index + 1;
    let defaultIndex = shift ? list.length - 1 : 0;
    const {
      el: next
    } = list[nextIndex] || list[defaultIndex];

    if (next.getAttribute("tabindex") === null) {
      next.setAttribute("tabindex", "0"); // jsdom requires tabIndex=0 for an item to become 'document.activeElement' (the browser does not)

      next.focus();
      next.removeAttribute("tabindex"); // leave no trace. :)
    } else {
      next.focus();
    }
  }

};
var _default = userEvent;
exports.default = _default;