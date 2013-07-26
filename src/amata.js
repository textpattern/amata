/**
 * Amata.js - List multi-selection multi-action form multi-task executer
 *
 * @link    https://github.com/textpattern/amata
 * @license MIT
 */

/*
 * Copyright (C) 2013 The Textpattern Development Team
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @name jQuery
 * @class
 */

/**
 * @name fn
 * @class
 * @memberOf jQuery
 */

(function (factory)
{
    'use strict';

    if (typeof define === 'function' && define.amd)
    {
        define(['jquery'], factory);
    }
    else
    {
        factory(window.jQuery);
    }
}(function ($)
{
    'use strict';

    /**
     * Methods.
     *
     * @var {Object}
     */

    var methods = {};

    /**
     * Initializes the multi-editor.
     *
     * @param {Object} [options={}] Options
     */

    methods.init = function (options)
    {
        options = $.extend({
            'selectAll'     : '[name=amata-select-all]',
            'button'        : '[type=submit]',
            'boxes'         : '[name="selected[]"]',
            'highlighted'   : 'tr',
            'selectedClass' : 'highlighted',
            'clickRegion'   : 'table tbody tr td'
        }, options);

        this.closest('form').not('.amata-ready').each(function ()
        {
            var $this = $(this), button = $this.find(options.button).hide(), actions = $(this).find('select.amata-actions').val(''), selectAll = $(options.selectAll), lastCheck = false;

            methods.registerOptions.call($this);

            selectAll.on('change', function ()
            {
                $(options.boxes).prop('checked', $(this).prop('checked')).change();
            });

            $this.on('click.amata', options.clickRegion, function (e)
            {
                var $this = $(this), self = ($(e.target).is(options.boxes) || $(this).is(options.boxes)), box, checked;

                if (!self)
                {
                    // Clicking the row, but without holding CTRL/ALT.

                    if (!e.altKey && !e.ctrlKey)
                    {
                        return;
                    }

                    // Skip actions invoked from clicking links and inputs.

                    if (e.target !== this || $this.is('a, :input') || $(e.target).is('a, :input'))
                    {
                        return;
                    }
                }

                box = $this.closest(options.highlighted).find(options.boxes).eq(0);

                if (!box.length)
                {
                    return;
                }

                checked = box.prop('checked');

                if (self)
                {
                    checked = !checked;
                }

                if (e.shiftKey && lastCheck)
                {
                    var boxes = $this.find(options.boxes), start = boxes.index(box), end = boxes.index(lastCheck);

                    boxes
                        .slice(Math.min(start, end), Math.max(start, end) + 1)
                        .prop('checked', !checked)
                        .change();
                }
                else if (!self)
                {
                    box.prop('checked', !checked).change();
                }

                if (checked === false)
                {
                    lastCheck = box;
                }
                else
                {
                    lastCheck = null;
                }
            });

            $this.on('change.amata', options.boxes, function ()
            {
                var box = $(this), boxes = $(options.boxes);

                if (box.prop('checked'))
                {
                    box.closest(options.highlighted).addClass(options.selectedClass);
                    selectAll.prop('checked', boxes.filter(':checked').length === boxes.length);
                }
                else
                {
                    box.closest(options.highlighted).removeClass(options.selectedClass);
                    selectAll.prop('checked', false);
                }
            });

            actions.on('change.amata', function ()
            {
                var selected = $(this).find('option:selected').eq(0);
                $this.trigger('amata-action-change.amata').find('.amata-active-step').remove();

                if (!selected.val())
                {
                    button.hide();
                    return;
                }

                if (selected.data('amata-method'))
                {
                    $(this).after($('<div />').attr('class', 'amata-active-step').html(selected.data('amata-method')));
                    button.show();
                }
                else
                {
                    button.hide();
                    $this.trigger('submit.amata');
                }
            });

            $this.addClass('.amata-ready');
        });

        return this;
    };

    /**
     * Adds a multi-edit option.
     *
     * @param  {object} options
     * @param  {string} options.label The option's label
     * @param  {string} options.value The option's value
     * @param  {string} options.html  The second step HTML
     * @return {object} this
     * @example
     * $('form').amata('addOption', {
     *  'label' : 'Delete',
     *  'value' : 'delete'
     * });
     */

    methods.addOption = function (options)
    {
        options = $.extend({
            'label' : null,
            'value' : null,
            'html'  : null
        }, options);

        var $this = this.closest('form').find('.amata-actions').eq(0).val(''), exists = false;

        if (!options.value || !$this.length)
        {
            return this;
        }

        var option = $this.find('option').filter(function ()
        {
            return $(this).val() === options.value;
        }).eq(0);

        exists = (option.length !== 0);

        if (!exists)
        {
            option = $('<option />');
        }

        if (!exists || !option.data('amata-method'))
        {
            if (!option.val())
            {
                option.val(options.value);
            }

            if (!option.text() && options.label)
            {
                option.text(options.label);
            }

            option.data('amata-method', options.html);

            if (!exists)
            {
                $this.append(option);
            }
        }

        return this;
    };

    /**
     * Registers multi-edit options from the document.
     *
     * @return   {Object} this
     * @method   registerOptions
     * @memberof jQuery.fn.amata
     */

    methods.registerOptions = function ()
    {
        return this.each(function ()
        {
            var $this = $(this), multiOptions = $this.find('[data-amata-option]');

            $this.find('select.amata-actions option').each(function ()
            {
                var value = $(this).val();

                if (value)
                {
                    var option = multiOptions.filter(function ()
                    {
                        return $(this).attr('data-amata-option') === value;
                    });

                    if (option.length > 0)
                    {
                        methods.addOption.call($this, {
                            'label' : null,
                            'html'  : option.eq(0).contents(),
                            'value' : $(this).val()
                        });
                    }
                }
            });

            multiOptions.remove();
        });
    };

    /**
     * Multi-edit functions.
     *
     * @param    {String|Object} [method=init] Called method
     * @param    {Object}        [options={}]  Options passed to the method
     * @class    amata
     * @memberof jQuery.fn
     */

    $.fn.amata = function (method, options)
    {
        if ($.type(method) !== 'string' || $.type(methods[method]) !== 'function')
        {
            options = method;
            method = 'init';
        }

        return methods[method].call(this, options);
    };
}));