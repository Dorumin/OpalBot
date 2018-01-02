function Command(obj) {
	var container = ui({
        className: 'command',
		children: [
            {
                className: 'header',
                events: {
                    click: function() {
                        var expanded = this.parentElement.classList.toggle('expanded'),
                        def = this.nextSibling;
                    
                        def.style.height = expanded ? def.scrollHeight + 'px' : '';
                    }
                },
                children: {
                    className: 'name',
                    children: [
                        {
                            tag: 'b',
                            text: obj.name
                        },
                        {
                            tag: 'span',
                            className: 'desc',
                            text: obj.desc
                        }
                    ]
                }
            },
            {
                className: 'def',
                children: [
                    {
                        className: 'aliases',
                        children: obj.aliases ?
                            [
                                {
                                    tag: 'b',
                                    text: 'Aliases: '
                                },
                                {
                                    tag: 'span',
                                    text: obj.aliases.join(', ')
                                }
                            ] :
                            {
                                tag: 'i',
                                text: 'No aliases.'
                            }
                    },
                    {
                        className: 'usage',
                        children: [
                            {
                                tag: 'b',
                                text: 'Usage: '
                            },
                            {
                                tag: 'span',
                                text: obj.usage
                            }
                        ]
                    },
                    {
                        tag: 'br'
                    },
                    {
                        className: 'description',
                        text: obj.description
                    }
                ]
            }
		]
	});
	return container;
}