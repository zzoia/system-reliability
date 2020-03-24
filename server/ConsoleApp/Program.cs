using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using ReliabilityModel.Model;
using ReliabilityModel.Model.Formatters;
using ReliabilityModel.Model.System;

namespace ConsoleApp
{
    public static class Program
	{
		public static void Main(string[] args)
        {
            var m1 = new SingleModuleSystem("I",  1);
            var m2 = new SingleModuleSystem("II");
            var m3 = new SingleModuleSystem("III");
            var m4 = new SingleModuleSystem("IV");
            var m5 = new SingleModuleSystem("V");
            var m6 = new SingleModuleSystem("VI");

            var system = new MultipleModuleSystem(
                new List<ReliabilityModel.Model.System.System>
                {
                    new MultipleModuleSystem(new List<ReliabilityModel.Model.System.System> { m1, m2 }, ReliabilityDependency.And),
                    new MultipleModuleSystem(new List<ReliabilityModel.Model.System.System> { m3, m4 }, ReliabilityDependency.And),
                    new MultipleModuleSystem(new List<ReliabilityModel.Model.System.System> { m5, m6 }, ReliabilityDependency.And)
                }, ReliabilityDependency.Or);

            var systemStateGraph = new SystemStateGraph(system);
            Console.WriteLine(new FullGraphFormatter(new AllStatesFilteringStrategy()).ToString(systemStateGraph));

            Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(system));
        }

        #region Work

        private static void Industries()
        {
            string[] lines = File.ReadAllLines("industries_old.txt");
            int index = 1;

            var sb = new StringBuilder();
            foreach (string line in lines)
            {
                sb.Append(
                    $"UPDATE dbo.Industries SET Title = '{line.Trim().Replace("'", "''")}' WHERE Id = {index};{Environment.NewLine}");
                index++;
            }

            string result = sb.ToString();
        }

        private static void IndustriesWithSubtitle()
        {
            string[] lines = File.ReadAllLines("industries.txt");
            int index = 1;

            var sb = new StringBuilder();
            foreach (string line in lines)
            {
                string title;
                string subtitle;

                string currentIndustry = line.Trim();
                int openingBrace = currentIndustry.IndexOf('(');
                if (openingBrace >= 0)
                {
                    title = currentIndustry.Substring(0, openingBrace).Trim();

                    subtitle = currentIndustry.Substring(openingBrace + 1);
                    subtitle = subtitle.Substring(0, subtitle.Length - 1);
                }
                else
                {
                    title = currentIndustry;
                    subtitle = null;
                }

                subtitle = subtitle == null ? "NULL" : ($"'{subtitle.Replace("'", "''")}'");
                sb.Append(
                    $"UPDATE dbo.Industries SET Title = '{title}', Subtitle = {subtitle} WHERE Id = {index};{Environment.NewLine}");
                index++;
            }

            string result = sb.ToString();
        } 

        #endregion
    }
}