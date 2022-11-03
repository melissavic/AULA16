/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OBJETIVO: Arquivo responsável pela manipulacao de recebimento, tratamento e retorno de dados entre api e model) //
// AUTOR: Melissa Victória                                                                                  //
// DATA: 06/10/2022                                                                                                //
// VERSAO: 1.0                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const { MESSAGE_ERROR, MESSAGE_SUCCESS } = require('../modulo/config.js')

const novoAluno = async function (aluno) {

    if (aluno.nome == '' || aluno.nome == undefined || aluno.foto == '' || aluno.foto == undefined || aluno.rg == '' || aluno.rg == undefined || aluno.cpf == '' || aluno.cpf == undefined || aluno.email == '' || aluno.email == undefined || aluno.data_nascimento == '' || aluno.data_nascimento == undefined) {

        return { status: 400, message: MESSAGE_ERROR.REQUIRED_FIELDS }

        //validacao para verificar email valido
    } else if (!aluno.email.includes('@')) {

        return { status: 400, message: MESSAGE_ERROR.INVALID_EMAIL }

    } else {

        //chamar a funcao insert criada na MODEL
        const novoAluno = require('../model/DAO/aluno.js')
        //Importa da MODEL aluno_curso (tabela de relacao entre aluno e curso)
        const novoAlunoCurso = require('../model/DAO/aluno_curso')
        const resultNovoAluno = await novoAluno.insertAluno(aluno)

        //Verifica se os dados do novo aluno foram inseridos no BD
        if (resultNovoAluno) {

            //Chama a funcao que veririfca qual o ID gerado para o novo aluno
            let idNovoAluno = await novoAluno.selectLastId()

            if (idNovoAluno > 0) {

                //Cria um objeto JSON
                let alunoCurso = {}

                //Retorna o ano corrente
                let anoMatricula = new Date().getFullYear()

                //Cria a matricula do aluno (id_aluno + id_curso + ano corrente)
                let numero_matricula = `${idNovoAluno}${aluno.curso[0].id_curso}${anoMatricula}`

                //Cria o objeto JSON com todas as chaves e valores
                alunoCurso.id_aluno = idNovoAluno
                alunoCurso.id_curso = aluno.curso[0].id_curso
                alunoCurso.matricula = numero_matricula
                alunoCurso.status_aluno = 'Cursando'

                //Chama a funcao para inserir na tabela alunoCurso
                const resultNovoAlunoCurso = await novoAlunoCurso.insertAlunoCurso(alunoCurso)

                if(resultNovoAlunoCurso){
                    return { status: 201, message: MESSAGE_SUCCESS.INSERT_ITEM }
                }else{
                    
                    //Caso aconteca um erro neste processo, obrigatoriamente
                    //devera ser excluido do DB o registro do aluno.
                    excluirAluno(idNovoAluno)
                    return { status: 500, message: MESSAGE_ERROR.INTERNAL_ERROR_DB }
                }
                    
            }else{
                    
                //Caso aconteca um erro neste processo, obrigatoriamente
                //devera ser excluido do DB o registro do aluno.
                excluirAluno(idNovoAluno)
                return { status: 500, message: MESSAGE_ERROR.INTERNAL_ERROR_DB }
            }

        }
        else {
            return { status: 500, message: MESSAGE_ERROR.INTERNAL_ERROR_DB }
        }

    }
}

const atualizarAluno = async function (aluno) {

    //Validacao do ID como campo obrigatorio
    if (aluno.id == '' || aluno.id == undefined) {
        return { status: 400, message: MESSAGE_ERROR.REQUIRED_ID }
    } else {

    }

    if (aluno.nome == '' || aluno.nome == undefined || aluno.foto == '' || aluno.foto == undefined || aluno.rg == '' || aluno.rg == undefined || aluno.cpf == '' || aluno.cpf == undefined || aluno.email == '' || aluno.email == undefined || aluno.data_nascimento == '' || aluno.data_nascimento == undefined) {

        return { status: 400, message: MESSAGE_ERROR.REQUIRED_FIELDS }

        //validacao para verificar email valido
    } else if (!aluno.email.includes('@')) {

        return { status: 400, message: MESSAGE_ERROR.INVALID_EMAIL }

    } else {

        //chamar a funcao update (atualizar) na MODEL
        const atualizarAluno = require('../model/DAO/aluno.js')
        const result = await atualizarAluno.updateAluno(aluno)

        if (result) {
            return { status: 201, message: MESSAGE_SUCCESS.UPDATE_ITEM }
        } else {
            return { status: 500, message: MESSAGE_ERROR.INTERNAL_ERROR_DB }
        }

    }
}


const listarAluno = async function () {
    let dadosAlunosJSON = {}

    const { selectAllAlunos } = require('../model/DAO/aluno.js')

    const dadosAlunos = await selectAllAlunos()

    if (dadosAlunos) {
        //Conversao do tipo de dados BigInt para int ???????
        // dadosAlunos.reverse().forEach(element => {
        //  element.id = Number(element.id)
        //})

        //Criamos uma chave alunos no jSON para retornar o array de alunos
        dadosAlunosJSON.alunos = dadosAlunos
        return dadosAlunosJSON
    } else {
        return false
    }
}


const excluirAluno = async function (id) {

    //Validacao do ID como campo obrigatorio
    if (id == '' || id == undefined) {
        return { status: 400, message: MESSAGE_ERROR.REQUIRE_ID }
    } else {

        //Validacao para verificar se o ID existe no BD
        const aluno = await buscarAluno(id)
        //Valida se foi encontrado um registro valido
        if (aluno) {

            //chamar a funcao update (atualizar) na MODEL
            const excluirAluno = require('../model/DAO/aluno.js')
            const result = await excluirAluno.deleteAluno(id)

            if (result) {
                return { status: 201, message: MESSAGE_SUCCESS.DELETE_ITEM }
            } else {
                return { status: 500, message: MESSAGE_ERROR.INTERNAL_ERROR_DB }
            }
        } else {
            return { status: 404, message: MESSAGE_ERROR.NOT_FOUND_DB }
        }
    }
}

const buscarAluno = async function (id) {
    let dadosAlunosJSON = {}

    if (id == '' || id == undefined) {
        return { status: 400, message: MESSAGE_ERROR.REQUIRE_ID }
    } else {

        const { selectByIdAluno } = require('../model/DAO/aluno.js')

        const dadosAluno = await selectByIdAluno(id)

        if (dadosAluno) {
            //Conversao do tipo de dados BigInt para int ???????
            // dadosAlunos.reverse().forEach(element => {
            //  element.id = Number(element.id)
            //})

            //Criamos uma chave alunos no jSON para retornar o array de alunos
            dadosAlunosJSON.aluno = dadosAluno
            return dadosAlunosJSON
        } else {
            return false
        }
    }
}


module.exports = {
    listarAluno,
    novoAluno,
    atualizarAluno,
    excluirAluno,
    buscarAluno
}