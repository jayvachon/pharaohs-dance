Shader "IndieEffects/Bloom" {
	Properties {
		_MainTex ("Base (RGB)", 2D) = "white" { }
		_BlurTex ("Base (RGB)", 2D) = "white" { }
		_Threshold ("Threshold", Range (0.0, 1.0)) = 0.7
		_Amount ("Amount", Range (0.0, 10.0)) = 1.0
		_Color ("Additive (A)", Color) = (1, 1, 1, 1)
	}
	
	CGINCLUDE
	#include "UnityCG.cginc"
	
	sampler2D _MainTex;
	sampler2D _BlurTex;
	float4 _MainTex_TexelSize;
	uniform float _Amount;
	uniform float _Threshold;
	float4 _Color;
	
	struct v2f {
		float4 pos : POSITION;
		float2 uv : TEXCOORD0;
	};
	
	struct v2f_m {
		float4 pos : POSITION;
		float2 uv[2] : TEXCOORD0;
	};
	
	v2f vert (appdata_img v)
	{
		v2f o;
		
		o.pos = mul (UNITY_MATRIX_MVP, v.vertex);

		o.uv = v.texcoord.xy;
		
		return o;
	}
	
	v2f_m vertV (appdata_img v)
	{
		v2f_m o;
		
		o.pos = mul (UNITY_MATRIX_MVP, v.vertex);
		float2 uv = v.texcoord.xy;
		
		float2 right = float2(_MainTex_TexelSize.x, 0.0);
			
		o.uv[0].xy = float2(_MainTex_TexelSize.x, 0.0);
		o.uv[1].xy = uv;
		
		return o;
	}
	
	v2f_m vertH (appdata_img v)
	{
		v2f_m o;
		
		o.pos = mul (UNITY_MATRIX_MVP, v.vertex);
		float2 uv = v.texcoord.xy;
		
		float2 up = float2(0.0, _MainTex_TexelSize.y);
			
		o.uv[0].xy = float2(0.0, _MainTex_TexelSize.y);
		o.uv[1].xy = uv;
		
		return o;
	}
	
	half4 frag (v2f i) : COLOR
	{
		float4 col = tex2D(_BlurTex, i.uv);
		
		if (Luminance( tex2D(_BlurTex, i.uv).rgb ) < _Threshold) {
			col.rgb = (0, 0, 0);
		}
		
		return col;
	}
	
	half4 fragV (v2f_m i) : COLOR
	{
		
		float4 col = tex2D(_BlurTex, i.uv[1]) * 0.2270270270;
		int radius = 10;
		int count = 0;
		float4 newCol;
		newCol.rgb = (0, 0, 0);
		for (int pix = 0; pix < radius; pix ++) {
			float2 uvOff = i.uv[0] * pix;
			
			float4 tmpColor = tex2D(_BlurTex, i.uv[1] + uvOff);
			if (i.uv[1].x + uvOff.x <= 1.0) {
				newCol += tmpColor;
				count ++;
			}
			
			tmpColor= tex2D(_BlurTex, i.uv[1] - uvOff);
			if (i.uv[1].x - uvOff.x >= 0.0) {
				newCol += tmpColor;
				count ++;
			}
			
		}
		
		newCol = newCol / count;
		
		return (col + newCol);
	}
	
	half4 fragH (v2f_m i) : COLOR
	{
		
		float4 col = tex2D(_BlurTex, i.uv[1]) * 0.2270270270;
		int radius = 10;
		int count = 0;
		float4 newCol;
		newCol.rgb = (0, 0, 0);
		for (int pix = 0; pix < radius; pix ++) {
			float2 uvOff = i.uv[0] * pix;
			
			float4 tmpColor = tex2D(_BlurTex, i.uv[1] + uvOff);
			if (i.uv[1].y + uvOff.y <= 1.0) {
				newCol += tmpColor;
				count ++;
			}
			
			tmpColor = tex2D(_BlurTex, i.uv[1] - uvOff);
			if (i.uv[1].y - uvOff.y >= 0.0) {
				newCol += tmpColor;
				count ++;
			}
			
		}
		
		newCol = newCol / count;
		
		return (col + newCol);
	}
	
	half4 fragFinal (v2f i) : COLOR
	{
		float4 col = tex2D(_MainTex, i.uv);
		col.rgb += tex2D(_BlurTex, i.uv) * _Amount;
		
		return col;
	}
	ENDCG
	
	SubShader {
		
		Pass {
			ZTest Always Cull Off ZWrite Off
			Fog { Mode off }
			Lighting Off
			blend SrcColor One
			
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			#pragma fragmentoption ARB_precision_hint_fastest
			#pragma target 3.0
			
			ENDCG
		}
		Pass {
			ZTest Always Cull Off ZWrite Off
			Fog { Mode off }
			Lighting Off
			blend SrcColor One
			CGPROGRAM
			#pragma vertex vertV
			#pragma fragment fragV
			#pragma fragmentoption ARB_precision_hint_fastest
			#pragma target 3.0
			
			ENDCG
		}
		Pass {
			ZTest Always Cull Off ZWrite Off
			Fog { Mode off }
			Lighting Off
			blend SrcColor One
			
			CGPROGRAM
			#pragma vertex vertH
			#pragma fragment fragH
			#pragma fragmentoption ARB_precision_hint_fastest
			#pragma target 3.0
			
			ENDCG
		}
		Pass {
			ZTest Always Cull Off ZWrite Off
			Fog { Mode off }
			Lighting Off
			
			CGPROGRAM
			#pragma vertex vertV
			#pragma fragment fragV
			#pragma fragmentoption ARB_precision_hint_fastest
			#pragma target 3.0
			
			ENDCG
		}
		Pass {
			ZTest Always Cull Off ZWrite Off
			Fog { Mode off }
			Lighting Off

			CGPROGRAM
			#pragma vertex vertH
			#pragma fragment fragH
			#pragma fragmentoption ARB_precision_hint_fastest
			#pragma target 3.0
			
			ENDCG
		}
		Pass {
			ZTest Always Cull Off ZWrite Off
			Fog { Mode off }
			Lighting Off
			blend DstColor One
			
			CGPROGRAM
			#pragma vertex vertV
			#pragma fragment fragV
			#pragma fragmentoption ARB_precision_hint_fastest
			#pragma target 3.0
			
			ENDCG
		}
		Pass {
			ZTest Always Cull Off ZWrite Off
			Fog { Mode off }
			Lighting off
			blend OneMinusSrcColor One
			
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment fragFinal
			#pragma fragmentoption ARB_precision_hint_fastest
			#pragma target 3.0
			
			ENDCG
		}
		
	}
	
	SubShader {
		Tags { "Queue" = "Overlay" }
		
		Pass {
			ZTest Always Cull Off ZWrite Off
			Fog { Mode off }
			Lighting Off
			
			SetTexture [_MainTex] {
				Combine texture
			}
		}
	}
	Fallback off
}
