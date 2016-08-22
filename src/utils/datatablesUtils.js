import $ from 'jquery'

/**
 * Datatables Utility to Allow UI Selection / Deselection
 * @param tableId Element Id for the table to enable selection and deselection routines.
 * @param callback Optional function return the result from the row selection.
 */
export default function enableTableSelection(tableId,callback){
  var elem = tableId+' tbody';
  $(elem).on( 'click', 'tr', function () {
    
    if($(this).hasClass('selected') ) {
      $(this).removeClass('selected');
    } else {    
      $('tr.selected').removeClass('selected');
      $(this).addClass('selected');
    }

    if(callback != null){
      var table =  $.fn.dataTable.Api( tableId );
      var selectedData = table.row('.selected').data();
      callback(selectedData);
    }

  });
}