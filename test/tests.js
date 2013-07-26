(function ($)
{
    'use strict';

    var optionCount = $('[data-amata-option]').length;

    $('form').amata();

    test('actionCountOnDocument', function()
    {
        equal(optionCount, $('select.amata-actions option').filter(function ()
        {
            return $(this).data('amata-method') && true;
        }).length);
    });

}(window.jQuery || window.Zepto));