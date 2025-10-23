(function(){
  function onSubmit(e){
    var form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (!form.matches('[data-confirm]')) return;
    if (form.dataset.confirmed === '1') return;
    e.preventDefault();
    var msg = form.getAttribute('data-confirm') || 'Are you sure?';
    if (window.Swal && Swal.fire) {
      Swal.fire({
        title: msg, icon: 'warning', showCancelButton: true,
        confirmButtonText: 'Yes', cancelButtonText: 'Cancel'
      }).then(function(r){
        if (r.isConfirmed) { form.dataset.confirmed='1'; form.submit(); }
      });
    } else {
      if (window.confirm(msg)) { form.dataset.confirmed='1'; form.submit(); }
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ document.addEventListener('submit', onSubmit, true); });
  } else {
    document.addEventListener('submit', onSubmit, true);
  }
})();
