var moment = require('moment')
var cloneDeep = require('lodash/cloneDeep')

function isRoleParent (role) {
    return ['demandeur', 'conjoint'].includes(role);
}

function ressourceHeader(individu) {
    switch (individu._role) {
    case 'demandeur':
        return 'Vos ressources personnelles uniquement';
    case 'conjoint':
        return 'Les ressources de votre conjoint·e';
    default:
        return 'Les ressources de ' + individu._firstName;
    }
}

function find(situation, role, id) {
    return situation[role] || situation.find(s => s.id === id)
}

function getDemandeur() {
    return get([], 'demandeur').individu
}

function getConjoint() {
    return get([], 'conjoint').individu
}

function get(individus, role, id) {
    let DEFAULT_INDIVIDU = {
        id: role,
        classe_scolarite: undefined,
        date_naissance: undefined,
        echelon_bourse: -1,
        enfant_a_charge: {},
        nationalite: undefined,
        _role: role,
    };

    let existingIndividu = find(individus, role, id);
    let individu = {
        ...cloneDeep(DEFAULT_INDIVIDU),
        ...cloneDeep(existingIndividu)
    };

    if (role == 'enfant' && !existingIndividu) {
        let usedIds = individus.map(function(enfant) { return enfant.id; });
        let count = 0;
        while (usedIds.indexOf('enfant_' + count) >= 0) {
            count = count + 1;
        }
        individu.id = 'enfant_' + count;
        const countDiplay = count + 1;
        individu._firstName = 'votre ' + countDiplay + (countDiplay === 1 ? 'ᵉʳ' : 'ᵉ' ) + ' enfant';
    }
    return {
        existingIndividu: Boolean(existingIndividu),
        individu,
    }
}

const Individu = {
    age: function(individu, dateDeReference) {
        return moment(dateDeReference).diff(individu.date_naissance, 'years');
    },

    label: function(individu) {
        if ('demandeur' === individu._role) {
            return 'vous';
        }

        if ('conjoint' === individu._role) {
            return 'votre conjoint·e';
        }

        return individu._firstName;
    },
    find,
    get,
    getDemandeur,
    getConjoint,
    ressourceHeader,

    ressourceShortLabel: function(individu) {
        switch (individu._role) {
        case 'demandeur':
            return 'vos ressources';
        default:
            return ressourceHeader(individu);
        }
    },

    nationaliteLabel: function(individu) {
        return 'TODO2' + individu.id;//NationaliteService.getLabel(individu.nationalite);
    },

    isRoleParent,

    isParent: function(individu) {
        return isRoleParent(individu._role);
    },

    formatStatutsSpecifiques: function(individu) {
        let statuts = [];

        if (individu.enceinte) {
            statuts.push('enceinte');
        }

        if (individu.boursier) {
            statuts.push('boursier');
        }

        if (individu.garde_alternee) {
            statuts.push('en garde alternée');
        }

        //TODO3 statuts = _.map(statuts, $filter('lowercaseFirst'));
        statuts = statuts.join(', ');
        //TODO3 statuts = $filter('uppercaseFirst')(statuts);
        return 'TODO3' //statuts;
    },
    scolariteOptions: [
        {
          value: 'inconnue',
          label: 'Aucun des deux'
        },
        {
          value: 'college',
          label: 'Au collège'
        },
        {
          value: 'lycee',
          label: 'Au lycée / En CAP / En CPA'
        }
    ],
}

module.exports = Individu
