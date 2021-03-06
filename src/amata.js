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
        factory(window.jQuery || window.Zepto);
    }
}(function ($)
{
    'use strict';

    /**
     * Methods.
     *
     * @var {Object}
     */

    var methods = {},

    /**
     * Interactable inputs, excluded from the alternate click region.
     *
     * @var {String}
     */

    inputs = 'a, input, textarea, select, button';

    /**
     * Initializes the multi-editor.
     *
     * @param    {Object} [options={}]            Options
     * @param    {String} [options.selectAll]     Selector for finding a "select all" checkbox toggle
     * @param    {String} [options.button]        Selector for finding the form's submit button
     * @param    {String} [options.boxes]         Selector for finding each row's checkbox
     * @param    {String} [options.highlighted]   Selector for finding highlighted region
     * @param    {String} [options.selectedClass] Class added to selected rows
     * @param    {String} [options.clickRegion]   Selector for find clickable region
     * @return   {Object} this
     * @method   init
     * @memberof jQuery.fn.amata
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

            selectAll.on('change.amata', function ()
            {
                $(options.boxes).prop('checked', $(this).prop('checked')).change();
            });

            $this.on('click.amata', options.clickRegion, function (e)
            {
                var row = $(this), self = ($(e.target).is(options.boxes) || row.is(options.boxes)), box, checked;

                if (!self)
                {
                    // Clicking the row, but without holding CTRL/ALT.

                    if (!e.altKey && !e.ctrlKey)
                    {
                        return;
                    }

                    // Skip actions invoked from clicking links and inputs.

                    if (e.target !== this || row.is(inputs) || $(e.target).is(inputs))
                    {
                        return;
                    }
                }

                box = row.closest(options.highlighted).find(options.boxes).eq(0);

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
                    box.prop('checked', !checked).trigger('change.amata');
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
                var box = $(this), boxes = $(options.boxes), closest = box.closest(options.highlighted);

                if (box.prop('checked'))
                {
                    closest.addClass(options.selectedClass);
                    selectAll.prop('checked', boxes.filter(':checked').length === boxes.length);
                }
                else
                {
                    closest.removeClass(options.selectedClass);
                    selectAll.prop('checked', false);
                }
            });

            actions.on('change.amata', function ()
            {
                var selected = $(this).find('option').filter(function ()
                {
                    return $(this).prop('selected');
                }).eq(0);

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
     * @param    {Object} [options={}]
     * @param    {String} [options.label] The option's label
     * @param    {String} [options.value] The option's value
     * @param    {String} [options.html]  The second step HTML
     * @return   {Object} this
     * @method   addOption
     * @memberof jQuery.fn.amata
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
                    }).eq(0);

                    if (option.length)
                    {
                        methods.addOption.call($this, {
                            'label' : null,
                            'html'  : option.html(),
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