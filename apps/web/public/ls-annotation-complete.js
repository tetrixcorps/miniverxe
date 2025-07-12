// Label Studio plugin: send postMessage to parent on annotation submit
window.LabelStudio && window.LabelStudio.on('annotationSubmit', function() {
  window.parent.postMessage(
    { type: 'LABEL_STUDIO_ANNOTATION_COMPLETE' },
    'http://localhost:5173' // Local development origin
  );
}); 