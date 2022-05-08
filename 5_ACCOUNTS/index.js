// modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

// modulos internos
const fs =require('fs')

operation()

function operation(){
    inquirer.prompt([
      {
        type:'list',
        name:'action',
        message:'O que você deseja fazer?',
        choices:[
            'Criar Conta',
            'Consultar Saldo',
            'Depositar',
            'Transferência',
            'Sacar',
            'Sair',   
        ],
      },
    ])
      .then((answer) =>{
          //  pegar a resposta do usuario 
        const action = answer['action']

        if(action==='Criar Conta'){
            createAccount()

        }else if(action === 'Depositar'){
            deposito()

        }else if(action=== 'Consultar Saldo'){
            getAccountBalance()

        }else if(action === 'Sacar'){
            sacar()

        }else if(action === 'Transferência'){
            transfer()

        }else if(action === 'Sair'){
            console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
             // encerrar o sistema
             process.exit()
        }
     
      })
      .catch((err)=>console.log(err))
}

// Criar Conta
const createAccount =()=>{
    console.log(chalk.bgGreen.bold.black('Parabéns por escolher nosso banco!'))
    console.log(chalk.green('Defina as opções de sua conta a seguir'))

    buildAccount()
}
    // criar nome da conta
const buildAccount =() =>{
    inquirer
    .prompt([
        {
            name:'accountName',
            message:'Digite um nome para sua conta:'
        },
    ])
    .then((answer) =>{
        const accountName = answer['accountName']

         // verificar se o diretório  existe,se não cria 
        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts')
        }

        // verifica se a conta existe no diretório, se tiver exibe um erro
        if(fs.existsSync(`accounts/${accountName}.json`)){
            console.log(chalk.bgRed.black('Esta conta já existe,escolha outro nome '),)
            buildAccount()
            return
        }

        // cria a conta no diretório
        fs.writeFileSync(`accounts/${accountName}.json`,'{"balance":0}',function(err){
            console.log(err)
        },)
            // mensagem após a conta ser criada
        console.log(chalk.green(`Parabéns ${accountName}, sua conta foi aberta com sucesso`))
        operation()
    })
    .catch((err) =>console.log(err))
}


  //Função Depositar

  function deposito(){
      inquirer.prompt([
          {
              name:'accountName',
              message:'Qual o nome da sua conta?',
          },
      ])
      .then((answer) =>{
          const accountName = answer['accountName']

          // verificar se a conta existe
          if(!checarConta(accountName)){
              return deposito()
          }

          inquirer.prompt([
              {
                  name:'amount',
                  message: 'Quanto você deseja depositar?',
              },
          ]).then((answer)=>{
              const amount = answer['amount']
              
              //add a amount(valor)
              addAmount(accountName,amount)
              operation()
          })
          .catch(err => console.log(err))
        })
      .catch(err =>console.log(err))
  }

  function checarConta(accountName){

    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Esta conta não existe tente novamente'))
        return false
    }
    return true
  }

  function addAmount(accountName,amount){
        const accountData = getAccount(accountName)

        if(!amount){
            console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
            return deposito()
        }
        
        accountData.balance  = parseFloat(amount) + parseFloat(accountData.balance)
        // salvar o arquivo com valor  do novo deposito   //(stringify) transforma JSON em texto
        fs.writeFileSync(`accounts/${accountName}.json`,JSON.stringify(accountData),
        function(err){
            console.log(err)
        },)

        console.log(chalk.green(`Foi depositado  o valor R$${amount} reais na sua conta`))
  }

  function getAccount(accountName){
      const accountJSON = fs.readFileSync(`accounts/${accountName}.json`,{
          encondig:'utf8',
          flag: 'r'
      })
    // retornar em formato de texto
      return JSON.parse(accountJSON)
  }
    
  // mostrar o saldo
  function   getAccountBalance(){
      inquirer
       .prompt([
           {
               name:'accountName',
               message:'Qual o nome da sua conta? '
           }
       ]).then((answer) =>{
            const accountName =answer['accountName']

            //verificar se a conta existe
            if(!checarConta(accountName)){
               return getAccountBalance()
            }
            const accountData = getAccount(accountName)

            console.log(chalk.bgBlue.black(`Olá, ${accountName} o saldo da sua conta é de R$ ${accountData.balance}`))
            operation()
       })
       .catch(err =>console.log(err))
  }
  //sacar o valor
  function sacar(){

    inquirer
    .prompt([
        {
            name:'accountName',
            message:'Qual a sua conta?'
        }
    ]).then((answer)=>{
        const accountName = answer['accountName']

        if(!checarConta(accountName)){
            return sacar()
        }

        inquirer
        .prompt([
            {
                name:'amount',
                message:'Quanto você deseja sacar?'
            }
        ]).then((answer)=>{
            const amount = answer['amount']
            removeAmount(accountName, amount)

         
        }).catch(err => console.log(err))
    }).catch(err => console.log(err))

  }
  // remover dinheiro da conta
 function removeAmount(accountName,amount){
    const accountData = getAccount(accountName)

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return sacar()
    }
    if(accountData.balance < amount){
        console.log(chalk.bgRed.black('Saldo insuficiente!'))
        return sacar()

    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(`accounts/${accountName}.json`,JSON.stringify(accountData),function(err){
        console.log(err)
    })

        console.log(chalk.green(`${accountName},foi realizado um saque de R$ ${amount} reais na sua conta`))
    
    
     operation()
 }  
    //transferencia de valores
 function transfer(accountNameTransfer,amount){

    inquirer
    .prompt([
        {
            name: 'accountName',
            message:'Qual o nome da sua conta?',    
        },
    ]).then( (answer)=>{
        const accountName = answer['accountName']

        if(!checarConta(accountName)){
           return transfer()
        }

        // conta do destinatario
            inquirer.prompt([
                {
                    name: 'accountNameTransfer',
                    message:'Entre com a conta do destinatário:',
                }
             ]).then((answer)=>{
                const accountNameTransfer = answer['accountNameTransfer']
           
                if(!checarConta(accountNameTransfer)){
                    return transfer()
               }

               // valor a ser transferido
               inquirer
                  .prompt([
            {
                name:'amount',
                message:'Qual o valor da transferência?',
            }
        ]).then((answer) =>{
            const amount = answer['amount']
            const accountData = getAccount(accountName)
    
            if(!amount){
                console.log(chalk.bgRed.black('Ocorreu um erro, tente mais tarde!'))
                return operation()
            
             }else if(accountData.balance>=amount){
                console.log(chalk.green(`${accountName}, foi transferido o valor de R$ ${amount} reais, para a conta de: ${accountNameTransfer}`))
                removeTransfer(accountName,amount)   
                addTransfer(accountNameTransfer,amount,accountData)
                return
            }else{
                console.log(chalk.bgRed.black('Saldo insuficiente!'))

                return operation()
            }

        
        })
        .catch(err =>console.log(err))

       })
         .catch(err =>console.log(err))

    })
    .catch(err => console.log(err))

 }
      // remover pela transferecia

      function removeTransfer(accountName,amount){
        const accountData = getAccount(accountName)
    
        if(!amount){
            console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
            return sacar()
        }
        if(accountData.balance < amount){
            console.log(chalk.bgRed.black('Saldo insuficiente!'))
            return sacar()
    
        }
    
        accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
    
        fs.writeFileSync(`accounts/${accountName}.json`,JSON.stringify(accountData),function(err){
            console.log(err)
        })

         operation()
     }

   // adicionar valor pela transferencia

   function addTransfer(accountName,amount){
    const accountData = getAccount(accountName)

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return deposito()
    }
    
    accountData.balance  = parseFloat(amount) + parseFloat(accountData.balance)
    // salvar o arquivo com valor  do novo deposito   //(stringify) transforma JSON em texto
    fs.writeFileSync(`accounts/${accountName}.json`,JSON.stringify(accountData),
    function(err){
        console.log(err)
    },)

}
