const forms = require("forms");
const { Product } = require('../models');
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

// forms boilerplate

var bootstrapField = function(name, object) {
    if (!Array.isArray(object.widget.classes)) {
        object.widget.classes = [];
    }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }
    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';
    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

// create flavors form
const createFlavorForm = () => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(100)]
        })
    })
}

// create topping form
const createToppingForm = () => {
        return forms.create({
            'name': fields.string({
                required: true,
                errorAfterField: true,
                cssClasses: {
                    label: ['form-label']
                },
                validators: [validators.maxlength(100)]
            })
        })
    }
    // create ingredients form
const createIngredientForm = () => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(100)]
        })
    })
}

// create dough type form
const createDoughTypeForm = (ingredients) => {
    console.log(ingredients);
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(100)]
        }),
        'ingredients': fields.string({
            label: "Choose Ingredients Below:",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.multipleCheckbox(),
            choices: ingredients
        }),

    })
}


// create product form
const createProductForm = (flavors, dough_types) => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'cost': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.integer()]
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(500)]
        }),
        "stock": fields.number({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.min(1)],
        }),
        "image": fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            }
        }),
        "flavor_id": fields.string({
            label: "Flavor",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            widget: widgets.select(),
            choices: flavors
        }),
        "dough_type_id": fields.string({
            label: "DoughType",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            widget: widgets.select(),
            choices: dough_types
        })
    })
};

// user forms
const createUserForm = () => {
    return forms.create({
        "name": fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.maxlength(45)]
        }),
        "email": fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.email(), validators.maxlength(255)]
        }),
        "password": fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.maxlength(32)]
        }),
        "confirm_password": fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.matchField("password")]
        }),
        "dob": fields.date({
            label: "DOB",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            widget: widget.date(),
        }),
        "phone": fields.number({
            label: "Contact Number",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.maxlength(45)]
        }),
        "address": fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.maxlength(255)]
        })
    })
}

const createLoginForm = () => {
    return forms.create({
        "email": fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.email()]
        }),
        "password": fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            }
        })
    })
}


module.exports = {
    createFlavorForm,
    createToppingForm,
    createProductForm,
    createIngredientForm,
    createDoughTypeForm,
    createUserForm,
    createLoginForm,
    bootstrapField
};