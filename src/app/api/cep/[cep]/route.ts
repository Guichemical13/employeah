import { NextRequest, NextResponse } from 'next/server';

/**
 * @route GET /api/cep/[cep]
 * @desc Busca endereço pelo CEP usando ViaCEP
 * @access Public
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ cep: string }> }) {
  const { cep } = await params;
  
  // Remove caracteres não numéricos
  const cleanCep = cep.replace(/\D/g, '');
  
  // Valida CEP (8 dígitos)
  if (cleanCep.length !== 8) {
    return NextResponse.json({ error: 'CEP inválido' }, { status: 400 });
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      return NextResponse.json({ error: 'CEP não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({
      cep: data.cep,
      logradouro: data.logradouro,
      complemento: data.complemento,
      bairro: data.bairro,
      localidade: data.localidade,
      uf: data.uf,
      ibge: data.ibge,
      gia: data.gia,
      ddd: data.ddd,
      siafi: data.siafi,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar CEP' }, { status: 500 });
  }
}
