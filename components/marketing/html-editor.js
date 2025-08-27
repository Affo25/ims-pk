"use client";

import FroalaEditor from "froala-editor";
import { useState, useEffect } from "react";
import "froala-editor/js/plugins.pkgd.min.js";
import "froala-editor/css/froala_style.min.css";
import { emptyHTML, signatures } from "@/lib/data";
import "froala-editor/css/froala_editor.pkgd.min.css";
import FroalaEditorComponent from "react-froala-wysiwyg";

const HTMLEditor = ({ onClose, onChange, id, defaultHTML }) => {
  const [html, setHtml] = useState(emptyHTML);
  const [controls, setControls] = useState(null);

  useEffect(() => {
    setHtml(defaultHTML);
  }, []);

  useEffect(() => {
    if (onClose) {
      setTimeout(() => {
        destroyEditor();
      }, 50);
    }
  }, [onClose]);

  FroalaEditor.RegisterCommand("resetButton", {
    title: "Reset",
    icon: "<span>Reset</span>",
    undo: true,
    refreshAfterCallback: true,
    callback: function () {
      this.html.set(emptyHTML);
      this.undo.saveStep();
    },
  });

  FroalaEditor.RegisterCommand("signatureButton", {
    type: "dropdown",
    title: "Signatures",
    icon: "<span>Signatures</span>",
    undo: true,
    refreshAfterCallback: true,
    options: {
      iboothme: "iboothme",
      partybox: "PartyBox",
      aizaz: "Aizaz",
      ben: "Ben",
      saqib: "Saqib",
      shubhneet: "Shubhneet",
      robin: "Robin",
      youssef: "Youssef",
      mayuri: "Mayuri",
    },
    callback: function (cmd, val) {
      this.html.insert(signatures[val]);
    },
  });

  const config = {
    fullPage: true,
    attribution: false,
    autofocus: true,
    heightMin: 200,
    heightMax: 200,
    fontFamilySelection: true,
    scrollableContainer: id,
    htmlAllowComments: true,
    htmlAllowedTags: [".*"],
    htmlAllowedAttrs: [".*"],
    htmlAllowedStyleProps: [".*"],
    pasteAllowedStyleProps: [".*"],
    pasteDeniedAttrs: [""],
    pasteDeniedTags: [""],
    htmlRemoveTags: [""],
    charCounterCount: false,
    quickInsertEnabled: false,
    linkEditButtons: ["linkEdit", "linkRemove"],
    linkAlwaysBlank: true,
    linkInsertButtons: "",
    placeholderText: "",
    toolbarButtons: [
      ["undo", "redo", "bold", "italic", "underline"],
      ["fontFamily", "fontSize", "textColor", "backgroundColor"],
      ["alignLeft", "alignCenter", "alignRight", "alignJustify", "formatOL", "formatUL"],
      ["insertLink", "insertTable", "emoticons", "selectAll", "html", "resetButton", "signatureButton"],
    ],
    events: {
      initialized: function () {
        this.html.set(defaultHTML);
      },
    },
  };

  const handleManualController = (initControls) => {
    if (initControls) {
      initControls.initialize();
      setControls(initControls);
    }
  };

  const destroyEditor = () => {
    controls.destroy();
  };

  const onHtmlChange = (e) => {
    setHtml(e);
    onChange(e);
  };

  return <FroalaEditorComponent model={html} onModelChange={onHtmlChange} config={config} onManualControllerReady={handleManualController} />;
};

export default HTMLEditor;
